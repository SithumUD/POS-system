package com.sithumud.pos_backend.sales;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.inventory.InventoryRepository;
import com.sithumud.pos_backend.inventory.StockMovementRepository;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.inventory.entity.StockMovement;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
import com.sithumud.pos_backend.product.ProductRepository;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.sales.dto.BatchSyncRequest;
import com.sithumud.pos_backend.sales.dto.BatchSyncResultDto;
import com.sithumud.pos_backend.sales.dto.CheckoutItemRequest;
import com.sithumud.pos_backend.sales.dto.CheckoutRequest;
import com.sithumud.pos_backend.sales.dto.CheckoutResponse;
import com.sithumud.pos_backend.sales.dto.PaymentDto;
import com.sithumud.pos_backend.sales.dto.PaymentTenderDto;
import com.sithumud.pos_backend.sales.dto.ReceiptDto;
import com.sithumud.pos_backend.sales.dto.RefundSaleRequest;
import com.sithumud.pos_backend.sales.dto.SaleDto;
import com.sithumud.pos_backend.sales.dto.SaleItemDto;
import com.sithumud.pos_backend.sales.dto.SaleSearchFilter;
import com.sithumud.pos_backend.sales.dto.VoidSaleRequest;
import com.sithumud.pos_backend.sales.entity.Payment;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleItem;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import com.sithumud.pos_backend.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request, UserPrincipal cashierUser) {
        if (StringUtils.hasText(request.getIdempotencyKey())) {
            Optional<Sale> existing = saleRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                log.info("Idempotency key hit for [{}]. Returning previously processed sale [{}]",
                        request.getIdempotencyKey(), existing.get().getReceiptNumber());
                return mapToCheckoutResponse(existing.get());
            }
        }

        Branch branch = branchRepository.findBySlug(request.getBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));

        User cashier = userRepository.findById(cashierUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Cashier user not found"));

        String receiptNumber = generateReceiptNumber();

        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (CheckoutItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + itemReq.getProductId()));

            BigDecimal itemUnitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getUnitPrice();
            BigDecimal itemDiscount = itemReq.getDiscount() != null ? itemReq.getDiscount() : BigDecimal.ZERO;
            BigDecimal lineTotal = itemUnitPrice.multiply(new BigDecimal(itemReq.getQuantity())).subtract(itemDiscount);

            subtotal = subtotal.add(lineTotal);

            SaleItem saleItem = SaleItem.builder()
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .productSkuSnapshot(product.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPriceAtSale(itemUnitPrice)
                    .discount(itemDiscount)
                    .lineTotal(lineTotal)
                    .build();

            saleItems.add(saleItem);
        }

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        BigDecimal grandTotal = subtotal.subtract(discount).add(tax);

        BigDecimal totalTendered = BigDecimal.ZERO;
        List<Payment> payments = new ArrayList<>();

        for (PaymentTenderDto pReq : request.getPayments()) {
            Payment payment = Payment.builder()
                    .method(pReq.getMethod())
                    .amount(pReq.getAmount())
                    .tenderedAmount(pReq.getTenderedAmount() != null ? pReq.getTenderedAmount() : pReq.getAmount())
                    .build();

            payments.add(payment);

            BigDecimal tenderVal = pReq.getTenderedAmount() != null ? pReq.getTenderedAmount() : pReq.getAmount();
            totalTendered = totalTendered.add(tenderVal);
        }

        if (totalTendered.compareTo(grandTotal) < 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INSUFFICIENT_PAYMENT",
                    String.format("Total tendered amount (LKR %s) is less than transaction total (LKR %s).", totalTendered, grandTotal));
        }

        Instant soldAt = (request.getOfflineSoldAt() != null) ? request.getOfflineSoldAt() : Instant.now();

        Sale sale = Sale.builder()
                .receiptNumber(receiptNumber)
                .branch(branch)
                .cashier(cashier)
                .terminalId(request.getTerminalId())
                .status(SaleStatus.COMPLETED)
                .soldAt(soldAt)
                .subtotal(subtotal)
                .discount(discount)
                .tax(tax)
                .total(grandTotal)
                .note(request.getNote())
                .idempotencyKey(request.getIdempotencyKey())
                .build();

        saleItems.forEach(sale::addItem);
        payments.forEach(sale::addPayment);

        Sale savedSale = saleRepository.save(sale);

        // Deduct inventory and record stock movement audit
        for (SaleItem item : saleItems) {
            Inventory inventory = inventoryRepository.findByProductAndBranch(item.getProduct(), branch)
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                            .product(item.getProduct())
                            .branch(branch)
                            .quantityOnHand(0)
                            .build()));

            inventory.setQuantityOnHand(inventory.getQuantityOnHand() - item.getQuantity());
            inventoryRepository.save(inventory);

            StockMovement movement = StockMovement.builder()
                    .product(item.getProduct())
                    .branch(branch)
                    .type(StockMovementType.SALE)
                    .quantity(-item.getQuantity())
                    .referenceId(receiptNumber)
                    .note("POS Sale · Terminal " + (request.getTerminalId() != null ? request.getTerminalId() : "1"))
                    .createdBy(cashier)
                    .build();

            stockMovementRepository.save(movement);
        }

        return mapToCheckoutResponse(savedSale);
    }

    @Transactional
    public List<BatchSyncResultDto> processBatchSync(BatchSyncRequest request, UserPrincipal cashierUser) {
        List<BatchSyncResultDto> results = new ArrayList<>();

        for (CheckoutRequest checkoutReq : request.getSales()) {
            try {
                if (StringUtils.hasText(checkoutReq.getIdempotencyKey()) &&
                        saleRepository.existsByIdempotencyKey(checkoutReq.getIdempotencyKey())) {
                    Sale existing = saleRepository.findByIdempotencyKey(checkoutReq.getIdempotencyKey()).orElseThrow();
                    results.add(BatchSyncResultDto.builder()
                            .idempotencyKey(checkoutReq.getIdempotencyKey())
                            .receiptNumber(existing.getReceiptNumber())
                            .status("DUPLICATE")
                            .build());
                } else {
                    CheckoutResponse response = processCheckout(checkoutReq, cashierUser);
                    results.add(BatchSyncResultDto.builder()
                            .idempotencyKey(checkoutReq.getIdempotencyKey())
                            .receiptNumber(response.getReceiptNumber())
                            .status("SYNCED")
                            .build());
                }
            } catch (Exception ex) {
                log.error("Failed to sync offline sale [key={}]", checkoutReq.getIdempotencyKey(), ex);
                results.add(BatchSyncResultDto.builder()
                        .idempotencyKey(checkoutReq.getIdempotencyKey())
                        .status("ERROR")
                        .error(ex.getMessage())
                        .build());
            }
        }

        return results;
    }

    @Transactional(readOnly = true)
    public Page<SaleDto> getSalesHistory(SaleSearchFilter filter, Pageable pageable) {
        Specification<Sale> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate receiptLike = cb.like(cb.lower(root.get("receiptNumber")), pattern);
                Predicate noteLike = cb.like(cb.lower(root.get("note")), pattern);
                predicates.add(cb.or(receiptLike, noteLike));
            }

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (filter.getCashierId() != null) {
                predicates.add(cb.equal(root.get("cashier").get("id"), filter.getCashierId()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("soldAt"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("soldAt"), filter.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Sale> salesPage = saleRepository.findAll(spec, pageable);
        List<SaleDto> dtos = salesPage.getContent().stream().map(SaleDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, salesPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public SaleDto getSaleById(UUID id) {
        Sale sale = saleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Sale not found with ID: " + id));

        return SaleDto.fromEntity(sale);
    }

    @Transactional
    public SaleDto voidSale(UUID id, VoidSaleRequest request, UserPrincipal userPrincipal) {
        Sale sale = saleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Sale not found with ID: " + id));

        if (sale.getStatus() == SaleStatus.VOIDED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ALREADY_VOIDED", "Sale is already voided.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        sale.setStatus(SaleStatus.VOIDED);
        sale.setNote(StringUtils.hasText(sale.getNote()) ? sale.getNote() + " | VOID: " + request.getReason() : "VOID: " + request.getReason());

        for (SaleItem item : sale.getItems()) {
            Inventory inventory = inventoryRepository.findByProductAndBranch(item.getProduct(), sale.getBranch())
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                            .product(item.getProduct())
                            .branch(sale.getBranch())
                            .quantityOnHand(0)
                            .build()));

            inventory.setQuantityOnHand(inventory.getQuantityOnHand() + item.getQuantity());
            inventoryRepository.save(inventory);

            StockMovement movement = StockMovement.builder()
                    .product(item.getProduct())
                    .branch(sale.getBranch())
                    .type(StockMovementType.VOID)
                    .quantity(item.getQuantity())
                    .referenceId(sale.getReceiptNumber())
                    .note("Void Sale Reason: " + request.getReason())
                    .createdBy(user)
                    .build();

            stockMovementRepository.save(movement);
        }

        Sale saved = saleRepository.save(sale);
        return SaleDto.fromEntity(saved);
    }

    @Transactional
    public SaleDto refundSale(UUID id, RefundSaleRequest request, UserPrincipal userPrincipal) {
        Sale sale = saleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Sale not found with ID: " + id));

        if (sale.getStatus() == SaleStatus.VOIDED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SALE_VOIDED", "Cannot refund a voided sale.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        sale.setStatus(SaleStatus.REFUNDED);
        sale.setNote(StringUtils.hasText(sale.getNote()) ? sale.getNote() + " | REFUND: " + request.getReason() : "REFUND: " + request.getReason());

        if (request.getItemQuantities() != null) {
            for (Map.Entry<UUID, Integer> entry : request.getItemQuantities().entrySet()) {
                UUID productId = entry.getKey();
                Integer returnQty = entry.getValue();

                productRepository.findById(productId).ifPresent(product -> {
                    Inventory inventory = inventoryRepository.findByProductAndBranch(product, sale.getBranch())
                            .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                                    .product(product)
                                    .branch(sale.getBranch())
                                    .quantityOnHand(0)
                                    .build()));

                    inventory.setQuantityOnHand(inventory.getQuantityOnHand() + returnQty);
                    inventoryRepository.save(inventory);

                    StockMovement movement = StockMovement.builder()
                            .product(product)
                            .branch(sale.getBranch())
                            .type(StockMovementType.RETURN)
                            .quantity(returnQty)
                            .referenceId(sale.getReceiptNumber())
                            .note("Refund Return: " + request.getReason())
                            .createdBy(user)
                            .build();

                    stockMovementRepository.save(movement);
                });
            }
        }

        Sale saved = saleRepository.save(sale);
        return SaleDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public ReceiptDto getReceipt(UUID id) {
        Sale sale = saleRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SALE_NOT_FOUND", "Sale not found with ID: " + id));

        SaleDto dto = SaleDto.fromEntity(sale);

        String thermalText = formatThermalReceipt(dto);

        return ReceiptDto.builder()
                .storeName("RetailOS POS")
                .legalName("Sathosa Group (Pvt) Ltd")
                .branchName(sale.getBranch().getName())
                .branchAddress(sale.getBranch().getAddress())
                .branchPhone(sale.getBranch().getPhone())
                .receiptNumber(sale.getReceiptNumber())
                .cashierName(sale.getCashier().getName())
                .soldAt(sale.getSoldAt())
                .items(dto.getItems())
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .payments(dto.getPayments())
                .tendered(dto.getTendered())
                .changeDue(dto.getChangeDue())
                .receiptFooter("Thank you for shopping with us! Please come again.")
                .formattedThermalText(thermalText)
                .build();
    }

    private CheckoutResponse mapToCheckoutResponse(Sale sale) {
        SaleDto dto = SaleDto.fromEntity(sale);
        return CheckoutResponse.builder()
                .saleId(sale.getId())
                .receiptNumber(sale.getReceiptNumber())
                .idempotencyKey(sale.getIdempotencyKey())
                .soldAt(sale.getSoldAt())
                .status(sale.getStatus())
                .branchSlug(sale.getBranch().getSlug())
                .cashierName(sale.getCashier().getName())
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .tendered(dto.getTendered())
                .changeDue(dto.getChangeDue())
                .items(dto.getItems())
                .payments(dto.getPayments())
                .build();
    }

    private String generateReceiptNumber() {
        long seq = System.currentTimeMillis() % 100000;
        int random = ThreadLocalRandom.current().nextInt(100, 999);
        return String.format("SALE-%d-%d", seq, random);
    }

    private String formatThermalReceipt(SaleDto sale) {
        StringBuilder sb = new StringBuilder();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());

        sb.append("========================================\n");
        sb.append("            RetailOS POS               \n");
        sb.append("      Sathosa Group (Pvt) Ltd          \n");
        sb.append(String.format(" %s\n", sale.getBranchName() != null ? sale.getBranchName() : "Main Branch"));
        sb.append("========================================\n");
        sb.append(String.format("Receipt #: %s\n", sale.getReceiptNumber()));
        sb.append(String.format("Date     : %s\n", formatter.format(sale.getSoldAt())));
        sb.append(String.format("Cashier  : %s\n", sale.getCashierName()));
        sb.append("----------------------------------------\n");
        sb.append(String.format("%-20s %3s %8s %8s\n", "ITEM", "QTY", "PRICE", "TOTAL"));
        sb.append("----------------------------------------\n");

        for (SaleItemDto item : sale.getItems()) {
            String name = item.getName().length() > 20 ? item.getName().substring(0, 17) + "..." : item.getName();
            sb.append(String.format("%-20s %3d %8.2f %8.2f\n",
                    name, item.getQuantity(), item.getUnitPrice(), item.getLineTotal()));
        }

        sb.append("----------------------------------------\n");
        sb.append(String.format("%-28s: LKR %8.2f\n", "SUBTOTAL", sale.getSubtotal()));
        if (sale.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
            sb.append(String.format("%-28s: LKR %8.2f\n", "DISCOUNT", sale.getDiscount()));
        }
        sb.append(String.format("%-28s: LKR %8.2f\n", "TAX (VAT)", sale.getTax()));
        sb.append(String.format("%-28s: LKR %8.2f\n", "GRAND TOTAL", sale.getTotal()));
        sb.append("----------------------------------------\n");
        sb.append(String.format("%-28s: LKR %8.2f\n", "TENDERED", sale.getTendered()));
        sb.append(String.format("%-28s: LKR %8.2f\n", "CHANGE DUE", sale.getChangeDue()));
        sb.append("========================================\n");
        sb.append("     Thank you for shopping with us!   \n");
        sb.append("========================================\n");

        return sb.toString();
    }
}
