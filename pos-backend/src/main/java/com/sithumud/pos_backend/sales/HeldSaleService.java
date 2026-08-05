package com.sithumud.pos_backend.sales;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.product.ProductRepository;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.sales.dto.HeldSaleDto;
import com.sithumud.pos_backend.sales.dto.HeldSaleItemRequest;
import com.sithumud.pos_backend.sales.dto.HeldSaleRequest;
import com.sithumud.pos_backend.sales.entity.HeldSale;
import com.sithumud.pos_backend.sales.entity.HeldSaleItem;
import com.sithumud.pos_backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeldSaleService {

    private final HeldSaleRepository heldSaleRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public HeldSaleDto parkCart(HeldSaleRequest request, UserPrincipal cashierUser) {
        Branch branch = branchRepository.findBySlug(request.getBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));

        User cashier = userRepository.findById(cashierUser.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Cashier user not found"));

        HeldSale heldSale = HeldSale.builder()
                .branch(branch)
                .cashier(cashier)
                .terminalId(request.getTerminalId())
                .label(request.getLabel().trim())
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .heldAt(Instant.now())
                .build();

        for (HeldSaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + itemReq.getProductId()));

            BigDecimal lineTotal = itemReq.getUnitPrice().multiply(new BigDecimal(itemReq.getQuantity()));

            HeldSaleItem item = HeldSaleItem.builder()
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .productSkuSnapshot(product.getSku())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(itemReq.getUnitPrice())
                    .build();

            heldSale.addItem(item);
        }

        HeldSale saved = heldSaleRepository.save(heldSale);
        return HeldSaleDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<HeldSaleDto> getHeldSales(String branchSlug) {
        List<HeldSale> heldSales = heldSaleRepository.findAllByBranchSlugOrderByHeldAtDesc(branchSlug);
        return heldSales.stream().map(HeldSaleDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public void discardHeldSale(UUID id) {
        HeldSale heldSale = heldSaleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "HELD_SALE_NOT_FOUND", "Held sale cart not found with ID: " + id));

        heldSaleRepository.delete(heldSale);
    }
}
