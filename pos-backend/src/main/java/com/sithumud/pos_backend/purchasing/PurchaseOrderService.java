package com.sithumud.pos_backend.purchasing;

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
import com.sithumud.pos_backend.purchasing.dto.CreatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderDto;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderItemRequest;
import com.sithumud.pos_backend.purchasing.dto.PurchaseOrderSearchFilter;
import com.sithumud.pos_backend.purchasing.dto.ReceivePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.dto.UpdatePurchaseOrderRequest;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrder;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderEvent;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderItem;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderStatus;
import com.sithumud.pos_backend.purchasing.entity.Supplier;
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

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;

    @Transactional(readOnly = true)
    public Page<PurchaseOrderDto> getPurchaseOrders(PurchaseOrderSearchFilter filter, Pageable pageable) {
        Specification<PurchaseOrder> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (filter.getSupplierId() != null) {
                predicates.add(cb.equal(root.get("supplier").get("id"), filter.getSupplierId()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate poLike = cb.like(cb.lower(root.get("poNumber")), pattern);
                Predicate notesLike = cb.like(cb.lower(root.get("notes")), pattern);
                predicates.add(cb.or(poLike, notesLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseOrder> page = purchaseOrderRepository.findAll(spec, pageable);
        List<PurchaseOrderDto> dtos = page.getContent().stream().map(PurchaseOrderDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getPurchaseOrderById(UUID id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found with ID: " + id));

        return PurchaseOrderDto.fromEntity(po);
    }

    @Transactional
    public PurchaseOrderDto createPurchaseOrder(CreatePurchaseOrderRequest request, UserPrincipal userPrincipal) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found: " + request.getSupplierId()));

        Branch branch = branchRepository.findBySlug(request.getBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        String poNumber = "PO-" + (System.currentTimeMillis() % 100000) + "-" + ThreadLocalRandom.current().nextInt(100, 999);
        PurchaseOrderStatus initialStatus = (request.getStatus() != null) ? request.getStatus() : PurchaseOrderStatus.DRAFT;

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplier(supplier)
                .branch(branch)
                .status(initialStatus)
                .createdBy(user)
                .expectedAt(request.getExpectedAt())
                .notes(request.getNotes())
                .build();

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + itemReq.getProductId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .quantityReceived(0)
                    .unitCost(itemReq.getUnitCost() != null ? itemReq.getUnitCost() : product.getCostPrice())
                    .build();

            po.addItem(item);
        }

        PurchaseOrderEvent event = PurchaseOrderEvent.builder()
                .description("Purchase order created in " + initialStatus + " status")
                .occurredAt(Instant.now())
                .actor(user)
                .build();
        po.addEvent(event);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseOrderDto.fromEntity(saved);
    }

    @Transactional
    public PurchaseOrderDto updatePurchaseOrder(UUID id, UpdatePurchaseOrderRequest request, UserPrincipal userPrincipal) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        if (po.getStatus() == PurchaseOrderStatus.CLOSED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PO_STATE", "Cannot modify a CLOSED or CANCELLED purchase order.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        po.setExpectedAt(request.getExpectedAt());
        po.setNotes(request.getNotes());

        po.getItems().clear();
        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + itemReq.getProductId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .product(product)
                    .quantityOrdered(itemReq.getQuantityOrdered())
                    .quantityReceived(0)
                    .unitCost(itemReq.getUnitCost() != null ? itemReq.getUnitCost() : product.getCostPrice())
                    .build();

            po.addItem(item);
        }

        PurchaseOrderEvent event = PurchaseOrderEvent.builder()
                .description("Purchase order item lines updated")
                .occurredAt(Instant.now())
                .actor(user)
                .build();
        po.addEvent(event);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseOrderDto.fromEntity(saved);
    }

    @Transactional
    public PurchaseOrderDto updateStatus(UUID id, PurchaseOrderStatus status, UserPrincipal userPrincipal) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        User user = (userPrincipal != null) ? userRepository.findById(userPrincipal.getId()).orElse(null) : null;

        PurchaseOrderStatus oldStatus = po.getStatus();
        po.setStatus(status);

        PurchaseOrderEvent event = PurchaseOrderEvent.builder()
                .description(String.format("Status changed from %s to %s", oldStatus, status))
                .occurredAt(Instant.now())
                .actor(user)
                .build();
        po.addEvent(event);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseOrderDto.fromEntity(saved);
    }

    @Transactional
    public PurchaseOrderDto receiveStock(UUID id, ReceivePurchaseOrderRequest request, UserPrincipal userPrincipal) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        if (po.getStatus() == PurchaseOrderStatus.CLOSED || po.getStatus() == PurchaseOrderStatus.CANCELLED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PO_STATE", "Cannot receive stock for a CLOSED or CANCELLED purchase order.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        int totalReceivedInBatch = 0;

        for (Map.Entry<UUID, Integer> entry : request.getItemQuantities().entrySet()) {
            UUID productId = entry.getKey();
            Integer qtyReceivedNow = entry.getValue();

            if (qtyReceivedNow <= 0) continue;

            for (PurchaseOrderItem item : po.getItems()) {
                if (item.getProduct().getId().equals(productId)) {
                    int currentReceived = item.getQuantityReceived() != null ? item.getQuantityReceived() : 0;
                    item.setQuantityReceived(currentReceived + qtyReceivedNow);
                    totalReceivedInBatch += qtyReceivedNow;

                    // Credit inventory stock
                    Inventory inventory = inventoryRepository.findByProductAndBranch(item.getProduct(), po.getBranch())
                            .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                                    .product(item.getProduct())
                                    .branch(po.getBranch())
                                    .quantityOnHand(0)
                                    .build()));

                    inventory.setQuantityOnHand(inventory.getQuantityOnHand() + qtyReceivedNow);
                    inventoryRepository.save(inventory);

                    // Record StockMovement audit entry
                    StockMovement movement = StockMovement.builder()
                            .product(item.getProduct())
                            .branch(po.getBranch())
                            .type(StockMovementType.PURCHASE)
                            .quantity(qtyReceivedNow)
                            .referenceId(po.getPoNumber())
                            .note("Purchase Order Receipt from " + po.getSupplier().getName())
                            .createdBy(user)
                            .build();

                    stockMovementRepository.save(movement);
                    break;
                }
            }
        }

        // Check if all items are fully received
        boolean allFullyReceived = true;
        boolean anyReceived = false;

        for (PurchaseOrderItem item : po.getItems()) {
            int received = item.getQuantityReceived() != null ? item.getQuantityReceived() : 0;
            if (received < item.getQuantityOrdered()) {
                allFullyReceived = false;
            }
            if (received > 0) {
                anyReceived = true;
            }
        }

        if (allFullyReceived) {
            po.setStatus(PurchaseOrderStatus.RECEIVED);
        } else if (anyReceived) {
            po.setStatus(PurchaseOrderStatus.PARTIALLY_RECEIVED);
        }

        PurchaseOrderEvent event = PurchaseOrderEvent.builder()
                .description(String.format("Received shipment of %d total units. PO status updated to %s", totalReceivedInBatch, po.getStatus()))
                .occurredAt(Instant.now())
                .actor(user)
                .build();
        po.addEvent(event);

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return PurchaseOrderDto.fromEntity(saved);
    }

    @Transactional
    public void deletePurchaseOrder(UUID id, UserPrincipal userPrincipal) {
        PurchaseOrder po = purchaseOrderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PO_NOT_FOUND", "Purchase order not found: " + id));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED || po.getStatus() == PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PO_STATE", "Cannot delete a purchase order that has received shipments.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();
        po.setStatus(PurchaseOrderStatus.CANCELLED);

        PurchaseOrderEvent event = PurchaseOrderEvent.builder()
                .description("Purchase order cancelled/deleted")
                .occurredAt(Instant.now())
                .actor(user)
                .build();
        po.addEvent(event);

        purchaseOrderRepository.save(po);
    }
}
