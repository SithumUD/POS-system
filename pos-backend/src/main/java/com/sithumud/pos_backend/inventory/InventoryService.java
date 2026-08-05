package com.sithumud.pos_backend.inventory;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.inventory.dto.CreateStockTransferRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentRequest;
import com.sithumud.pos_backend.inventory.dto.StockAdjustmentResponse;
import com.sithumud.pos_backend.inventory.dto.StockLevelDto;
import com.sithumud.pos_backend.inventory.dto.StockMovementDto;
import com.sithumud.pos_backend.inventory.dto.StockMovementSearchFilter;
import com.sithumud.pos_backend.inventory.dto.StockSearchFilter;
import com.sithumud.pos_backend.inventory.dto.StockTransferDto;
import com.sithumud.pos_backend.inventory.dto.StockTransferItemRequest;
import com.sithumud.pos_backend.inventory.dto.StockTransferSearchFilter;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.inventory.entity.StockMovement;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
import com.sithumud.pos_backend.inventory.entity.StockTransfer;
import com.sithumud.pos_backend.inventory.entity.StockTransferItem;
import com.sithumud.pos_backend.inventory.entity.TransferStatus;
import com.sithumud.pos_backend.product.ProductRepository;
import com.sithumud.pos_backend.product.dto.StockStatus;
import com.sithumud.pos_backend.product.entity.Product;
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
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockTransferRepository stockTransferRepository;
    private final BranchRepository branchRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<StockLevelDto> getLiveStock(StockSearchFilter filter, Pageable pageable) {
        Specification<Inventory> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("product").get("name")), pattern);
                Predicate skuLike = cb.like(cb.lower(root.get("product").get("sku")), pattern);
                Predicate barcodeLike = cb.like(cb.lower(root.get("product").get("barcode")), pattern);
                predicates.add(cb.or(nameLike, skuLike, barcodeLike));
            }

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("product").get("category").get("id"), filter.getCategoryId()));
            }

            if (filter.getSupplierId() != null) {
                predicates.add(cb.equal(root.get("product").get("supplier").get("id"), filter.getSupplierId()));
            }

            if (filter.getStockStatus() != null && filter.getStockStatus() != StockStatus.ALL) {
                if (filter.getStockStatus() == StockStatus.OUT_OF_STOCK) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("quantityOnHand"), 0));
                } else if (filter.getStockStatus() == StockStatus.LOW_STOCK) {
                    predicates.add(cb.and(
                            cb.greaterThan(root.get("quantityOnHand"), 0),
                            cb.lessThanOrEqualTo(root.get("quantityOnHand"), root.get("product").get("reorderThreshold"))
                    ));
                } else if (filter.getStockStatus() == StockStatus.IN_STOCK) {
                    predicates.add(cb.greaterThan(root.get("quantityOnHand"), root.get("product").get("reorderThreshold")));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Inventory> page = inventoryRepository.findAll(spec, pageable);
        List<StockLevelDto> dtos = page.getContent().stream().map(StockLevelDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional
    public StockAdjustmentResponse adjustStock(StockAdjustmentRequest request, UserPrincipal userPrincipal) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + request.getProductId()));

        Branch branch = branchRepository.findBySlug(request.getBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Branch not found: " + request.getBranchSlug()));

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        Inventory inventory = inventoryRepository.findByProductAndBranch(product, branch)
                .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                        .product(product)
                        .branch(branch)
                        .quantityOnHand(0)
                        .build()));

        int previousQty = inventory.getQuantityOnHand() != null ? inventory.getQuantityOnHand() : 0;
        int delta;
        int newQty;

        String actionUpper = request.getAction().toUpperCase().trim();
        if ("ADD".equals(actionUpper)) {
            delta = request.getQuantity();
            newQty = previousQty + delta;
        } else if ("REMOVE".equals(actionUpper)) {
            delta = -request.getQuantity();
            newQty = previousQty + delta;
        } else if ("CORRECTION".equals(actionUpper)) {
            newQty = request.getQuantity();
            delta = newQty - previousQty;
        } else {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_ACTION", "Action must be ADD, REMOVE, or CORRECTION");
        }

        inventory.setQuantityOnHand(newQty);
        inventoryRepository.save(inventory);

        String refId = "ADJ-" + (System.currentTimeMillis() % 100000) + "-" + ThreadLocalRandom.current().nextInt(100, 999);
        String noteText = request.getReason() + (StringUtils.hasText(request.getNote()) ? " — " + request.getNote() : "");

        StockMovement movement = StockMovement.builder()
                .product(product)
                .branch(branch)
                .type(StockMovementType.ADJUSTMENT)
                .quantity(delta)
                .referenceId(refId)
                .note(noteText)
                .createdBy(user)
                .build();

        stockMovementRepository.save(movement);

        return StockAdjustmentResponse.builder()
                .id(movement.getId())
                .referenceId(refId)
                .productId(product.getId())
                .productName(product.getName())
                .sku(product.getSku())
                .branchSlug(branch.getSlug())
                .action(actionUpper)
                .previousQuantity(previousQty)
                .adjustedQuantityDelta(delta)
                .newQuantity(newQty)
                .reason(request.getReason())
                .adjustedBy(user.getName())
                .adjustedAt(movement.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<StockMovementDto> getStockMovements(StockMovementSearchFilter filter, Pageable pageable) {
        Specification<StockMovement> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getProductId() != null) {
                predicates.add(cb.equal(root.get("product").get("id"), filter.getProductId()));
            }

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("type"), filter.getType()));
            }

            if (StringUtils.hasText(filter.getReferenceId())) {
                predicates.add(cb.like(cb.lower(root.get("referenceId")), "%" + filter.getReferenceId().toLowerCase() + "%"));
            }

            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.getEndDate()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StockMovement> page = stockMovementRepository.findAll(spec, pageable);
        List<StockMovementDto> dtos = page.getContent().stream().map(StockMovementDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<StockTransferDto> getTransfers(StockTransferSearchFilter filter, Pageable pageable) {
        Specification<StockTransfer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getFromBranchSlug())) {
                predicates.add(cb.equal(root.get("fromBranch").get("slug"), filter.getFromBranchSlug()));
            }

            if (StringUtils.hasText(filter.getToBranchSlug())) {
                predicates.add(cb.equal(root.get("toBranch").get("slug"), filter.getToBranchSlug()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StockTransfer> page = stockTransferRepository.findAll(spec, pageable);
        List<StockTransferDto> dtos = page.getContent().stream().map(StockTransferDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional
    public StockTransferDto createTransfer(CreateStockTransferRequest request, UserPrincipal userPrincipal) {
        if (request.getFromBranchSlug().equalsIgnoreCase(request.getToBranchSlug())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_BRANCH", "Source and destination branches cannot be the same.");
        }

        Branch fromBranch = branchRepository.findBySlug(request.getFromBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Source branch not found: " + request.getFromBranchSlug()));

        Branch toBranch = branchRepository.findBySlug(request.getToBranchSlug())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Destination branch not found: " + request.getToBranchSlug()));

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        String transferNumber = "TRF-" + (System.currentTimeMillis() % 100000) + "-" + ThreadLocalRandom.current().nextInt(100, 999);

        StockTransfer transfer = StockTransfer.builder()
                .transferNumber(transferNumber)
                .fromBranch(fromBranch)
                .toBranch(toBranch)
                .status(TransferStatus.IN_TRANSIT)
                .note(request.getNote())
                .createdBy(user)
                .build();

        for (StockTransferItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found: " + itemReq.getProductId()));

            Inventory sourceInventory = inventoryRepository.findByProductAndBranch(product, fromBranch)
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                            .product(product)
                            .branch(fromBranch)
                            .quantityOnHand(0)
                            .build()));

            sourceInventory.setQuantityOnHand(sourceInventory.getQuantityOnHand() - itemReq.getQuantity());
            inventoryRepository.save(sourceInventory);

            StockMovement outMovement = StockMovement.builder()
                    .product(product)
                    .branch(fromBranch)
                    .type(StockMovementType.TRANSFER_OUT)
                    .quantity(-itemReq.getQuantity())
                    .referenceId(transferNumber)
                    .note("Inter-branch dispatch to " + toBranch.getName())
                    .createdBy(user)
                    .build();

            stockMovementRepository.save(outMovement);

            StockTransferItem item = StockTransferItem.builder()
                    .product(product)
                    .productNameSnapshot(product.getName())
                    .productSkuSnapshot(product.getSku())
                    .quantity(itemReq.getQuantity())
                    .build();

            transfer.addItem(item);
        }

        StockTransfer saved = stockTransferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }

    @Transactional
    public StockTransferDto completeTransfer(UUID id, UserPrincipal userPrincipal) {
        StockTransfer transfer = stockTransferRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TRANSFER_NOT_FOUND", "Stock transfer not found with ID: " + id));

        if (transfer.getStatus() != TransferStatus.IN_TRANSIT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Only IN_TRANSIT transfers can be completed.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        transfer.setStatus(TransferStatus.COMPLETED);
        transfer.setCompletedAt(Instant.now());

        for (StockTransferItem item : transfer.getItems()) {
            Inventory destInventory = inventoryRepository.findByProductAndBranch(item.getProduct(), transfer.getToBranch())
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                            .product(item.getProduct())
                            .branch(transfer.getToBranch())
                            .quantityOnHand(0)
                            .build()));

            destInventory.setQuantityOnHand(destInventory.getQuantityOnHand() + item.getQuantity());
            inventoryRepository.save(destInventory);

            StockMovement inMovement = StockMovement.builder()
                    .product(item.getProduct())
                    .branch(transfer.getToBranch())
                    .type(StockMovementType.TRANSFER_IN)
                    .quantity(item.getQuantity())
                    .referenceId(transfer.getTransferNumber())
                    .note("Inter-branch receipt from " + transfer.getFromBranch().getName())
                    .createdBy(user)
                    .build();

            stockMovementRepository.save(inMovement);
        }

        StockTransfer saved = stockTransferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }

    @Transactional
    public StockTransferDto cancelTransfer(UUID id, UserPrincipal userPrincipal) {
        StockTransfer transfer = stockTransferRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TRANSFER_NOT_FOUND", "Stock transfer not found with ID: " + id));

        if (transfer.getStatus() != TransferStatus.IN_TRANSIT) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_STATUS", "Only IN_TRANSIT transfers can be cancelled.");
        }

        User user = userRepository.findById(userPrincipal.getId()).orElseThrow();

        transfer.setStatus(TransferStatus.CANCELLED);

        // Restore stock to source branch
        for (StockTransferItem item : transfer.getItems()) {
            Inventory sourceInventory = inventoryRepository.findByProductAndBranch(item.getProduct(), transfer.getFromBranch())
                    .orElseGet(() -> inventoryRepository.save(Inventory.builder()
                            .product(item.getProduct())
                            .branch(transfer.getFromBranch())
                            .quantityOnHand(0)
                            .build()));

            sourceInventory.setQuantityOnHand(sourceInventory.getQuantityOnHand() + item.getQuantity());
            inventoryRepository.save(sourceInventory);

            StockMovement restoreMovement = StockMovement.builder()
                    .product(item.getProduct())
                    .branch(transfer.getFromBranch())
                    .type(StockMovementType.ADJUSTMENT)
                    .quantity(item.getQuantity())
                    .referenceId(transfer.getTransferNumber())
                    .note("Transfer Cancelled — Restored to source branch")
                    .createdBy(user)
                    .build();

            stockMovementRepository.save(restoreMovement);
        }

        StockTransfer saved = stockTransferRepository.save(transfer);
        return StockTransferDto.fromEntity(saved);
    }
}
