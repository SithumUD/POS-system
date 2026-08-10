package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.inventory.InventoryRepository;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.product.dto.BranchStockDto;
import com.sithumud.pos_backend.product.dto.CreateProductRequest;
import com.sithumud.pos_backend.product.dto.ProductDto;
import com.sithumud.pos_backend.product.dto.ProductSearchFilter;
import com.sithumud.pos_backend.product.dto.StockStatus;
import com.sithumud.pos_backend.product.dto.UpdateProductRequest;
import com.sithumud.pos_backend.product.entity.Category;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.purchasing.SupplierRepository;
import com.sithumud.pos_backend.purchasing.entity.Supplier;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sithumud.pos_backend.tenant.TenantRepository;
import com.sithumud.pos_backend.tenant.context.TenantContext;
import com.sithumud.pos_backend.tenant.entity.Tenant;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public Page<ProductDto> getProducts(ProductSearchFilter filter, Pageable pageable) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (Boolean.TRUE.equals(filter.getActiveOnly())) {
                predicates.add(cb.equal(root.get("active"), true));
            }

            if (StringUtils.hasText(filter.getSearch())) {
                String searchPattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate skuLike = cb.like(cb.lower(root.get("sku")), searchPattern);
                Predicate barcodeLike = cb.like(cb.lower(root.get("barcode")), searchPattern);
                predicates.add(cb.or(nameLike, skuLike, barcodeLike));
            }

            if (filter.getCategoryId() != null) {
                predicates.add(cb.or(
                        cb.equal(root.get("category").get("id"), filter.getCategoryId()),
                        cb.equal(root.get("category").get("parent").get("id"), filter.getCategoryId())
                ));
            } else if (StringUtils.hasText(filter.getCategorySlug())) {
                predicates.add(cb.or(
                        cb.equal(root.get("category").get("slug"), filter.getCategorySlug()),
                        cb.equal(root.get("category").get("parent").get("slug"), filter.getCategorySlug())
                ));
            }

            if (filter.getSupplierId() != null) {
                predicates.add(cb.equal(root.get("preferredSupplier").get("id"), filter.getSupplierId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Product> productsPage = productRepository.findAll(spec, pageable);

        List<ProductDto> dtos = productsPage.getContent().stream()
                .map(this::mapToProductDto)
                .filter(dto -> filterByStockStatus(dto, filter.getStockStatus(), filter.getBranchSlug()))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, productsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductDto getProductById(UUID id) {
        Product product = productRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + id));

        return mapToProductDto(product);
    }

    @Transactional
    public ProductDto createProduct(CreateProductRequest request) {
        Tenant tenant = tenantRepository.findById(TenantContext.getTenantId())
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "TENANT_NOT_FOUND", "Current tenant not found."));

        long currentProductCount = productRepository.count();
        if (currentProductCount >= tenant.getMaxProducts()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "LIMIT_EXCEEDED", "Your subscription plan allows a maximum of " + tenant.getMaxProducts() + " products.");
        }

        if (productRepository.existsBySku(request.getSku())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SKU", "Product SKU '" + request.getSku() + "' already exists.");
        }

        if (StringUtils.hasText(request.getBarcode()) && productRepository.existsByBarcode(request.getBarcode())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_BARCODE", "Product Barcode '" + request.getBarcode() + "' already exists.");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found with ID: " + request.getCategoryId()));
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found with ID: " + request.getSupplierId()));
        }

        Product product = Product.builder()
                .sku(request.getSku().trim().toUpperCase())
                .barcode(StringUtils.hasText(request.getBarcode()) ? request.getBarcode().trim() : null)
                .name(request.getName().trim())
                .category(category)
                .unitPrice(request.getPrice())
                .costPrice(request.getCost())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : java.math.BigDecimal.ZERO)
                .reorderThreshold(request.getThreshold() != null ? request.getThreshold() : 0)
                .unitOfMeasure(request.getUnitOfMeasure() != null ? request.getUnitOfMeasure() : com.sithumud.pos_backend.product.entity.UnitOfMeasure.EACH)
                .unitLabel(request.getUnit() != null ? request.getUnit().trim() : "Unit")
                .imageUrl(request.getImageUrl())
                .preferredSupplier(supplier)
                .active(request.isActive())
                .build();

        Product saved = productRepository.save(product);

        if (request.getInitialStock() != null && !request.getInitialStock().isEmpty()) {
            for (Map.Entry<String, Integer> entry : request.getInitialStock().entrySet()) {
                String branchSlug = entry.getKey();
                Integer qty = entry.getValue();
                branchRepository.findBySlug(branchSlug).ifPresent(branch -> {
                    Inventory inventory = Inventory.builder()
                            .product(saved)
                            .branch(branch)
                            .quantityOnHand(qty != null ? qty : 0)
                            .build();
                    inventoryRepository.save(inventory);
                });
            }
        }

        return mapToProductDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(UUID id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + id));

        if (!product.getSku().equalsIgnoreCase(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_SKU", "Product SKU '" + request.getSku() + "' already exists.");
        }

        if (StringUtils.hasText(request.getBarcode()) &&
                (product.getBarcode() == null || !product.getBarcode().equals(request.getBarcode())) &&
                productRepository.existsByBarcode(request.getBarcode())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_BARCODE", "Product Barcode '" + request.getBarcode() + "' already exists.");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "CATEGORY_NOT_FOUND", "Category not found with ID: " + request.getCategoryId()));
        }

        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found with ID: " + request.getSupplierId()));
        }

        product.setSku(request.getSku().trim().toUpperCase());
        product.setBarcode(StringUtils.hasText(request.getBarcode()) ? request.getBarcode().trim() : null);
        product.setName(request.getName().trim());
        product.setCategory(category);
        product.setUnitPrice(request.getPrice());
        product.setCostPrice(request.getCost());
        if (request.getTaxRate() != null) product.setTaxRate(request.getTaxRate());
        if (request.getThreshold() != null) product.setReorderThreshold(request.getThreshold());
        if (request.getUnitOfMeasure() != null) product.setUnitOfMeasure(request.getUnitOfMeasure());
        if (request.getUnit() != null) product.setUnitLabel(request.getUnit().trim());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        product.setPreferredSupplier(supplier);
        if (request.getActive() != null) product.setActive(request.getActive());

        Product saved = productRepository.save(product);
        return mapToProductDto(saved);
    }

    @Transactional
    public ProductDto toggleActive(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + id));

        product.setActive(!product.isActive());
        Product saved = productRepository.save(product);
        return mapToProductDto(saved);
    }

    @Transactional
    public ProductDto duplicateProduct(UUID id) {
        Product original = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + id));

        String newSku = original.getSku() + "-COPY";
        int counter = 1;
        while (productRepository.existsBySku(newSku)) {
            newSku = original.getSku() + "-COPY-" + counter++;
        }

        Product duplicate = Product.builder()
                .sku(newSku)
                .name(original.getName() + " (Draft)")
                .category(original.getCategory())
                .unitPrice(original.getUnitPrice())
                .costPrice(original.getCostPrice())
                .taxRate(original.getTaxRate())
                .reorderThreshold(original.getReorderThreshold())
                .unitOfMeasure(original.getUnitOfMeasure())
                .unitLabel(original.getUnitLabel())
                .imageUrl(original.getImageUrl())
                .preferredSupplier(original.getPreferredSupplier())
                .active(false) // duplicated product starts as draft (inactive)
                .build();

        Product saved = productRepository.save(duplicate);
        return mapToProductDto(saved);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PRODUCT_NOT_FOUND", "Product not found with ID: " + id));

        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDto mapToProductDto(Product product) {
        List<Inventory> inventories = inventoryRepository.findByProduct(product);

        int totalQty = inventories.stream().mapToInt(Inventory::getQuantityOnHand).sum();

        List<BranchStockDto> branchStock = inventories.stream().map(inv -> BranchStockDto.builder()
                .branchId(inv.getBranch().getId())
                .branchSlug(inv.getBranch().getSlug())
                .branchName(inv.getBranch().getName())
                .quantity(inv.getQuantityOnHand())
                .build()).collect(Collectors.toList());

        return ProductDto.fromEntity(product, totalQty, branchStock);
    }

    private boolean filterByStockStatus(ProductDto dto, StockStatus status, String branchSlug) {
        if (status == null || status == StockStatus.ALL) {
            return true;
        }

        int qty = dto.getTotalQuantity();
        if (StringUtils.hasText(branchSlug) && dto.getBranchStock() != null) {
            qty = dto.getBranchStock().stream()
                    .filter(bs -> bs.getBranchSlug().equalsIgnoreCase(branchSlug))
                    .mapToInt(BranchStockDto::getQuantity)
                    .findFirst()
                    .orElse(0);
        }

        int threshold = dto.getThreshold() != null ? dto.getThreshold() : 0;

        return switch (status) {
            case IN_STOCK -> qty > threshold;
            case LOW_STOCK -> qty > 0 && qty <= threshold;
            case OUT_OF_STOCK -> qty <= 0;
            default -> true;
        };
    }
}
