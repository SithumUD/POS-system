package com.sithumud.pos_backend.product.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import com.sithumud.pos_backend.purchasing.entity.Supplier;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_sku", columnList = "sku", unique = true),
        @Index(name = "idx_product_barcode", columnList = "barcode", unique = true)
})
public class Product extends BaseEntity {

    /** Stock Keeping Unit code — unique across the catalogue. Example: "BEV-CC-400". */
    @NotBlank
    @Column(nullable = false, unique = true)
    private String sku;

    /** EAN-13, EAN-8, UPC-A, or similar barcode. Nullable (not all products are barcoded). */
    @Column(unique = true)
    private String barcode;

    /** Display name shown on receipts and the POS screen. */
    @NotBlank
    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    /** Current selling price (in the store's base currency). */
    @PositiveOrZero
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    /** Purchase / cost price used for margin calculations. */
    @PositiveOrZero
    @Column(name = "cost_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice;

    /**
     * Product-level tax rate override (percentage, e.g. 10.00 = 10%).
     * When set to 0, the store-level default tax rate from StoreSetting is used.
     */
    @PositiveOrZero
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    /**
     * Minimum quantity-on-hand before a low-stock alert is raised.
     * Overrides the store-level default from StoreSetting when > 0.
     */
    @PositiveOrZero
    @Column(name = "reorder_threshold", nullable = false)
    @Builder.Default
    private Integer reorderThreshold = 0;

    /**
     * Enum representation of the unit of measure — used for internal logic
     * (e.g. weight-based pricing, volume conversions).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure", nullable = false, length = 20)
    @Builder.Default
    private UnitOfMeasure unitOfMeasure = UnitOfMeasure.EACH;

    /**
     * Human-readable label for the unit shown on receipts and the POS screen.
     * Example: "Bottle", "Pack", "Kg". Free-text so tenants can customise it.
     */
    @Column(name = "unit_label", length = 50)
    private String unitLabel;

    /** URL to the product image (CDN or storage bucket path). Nullable. */
    @Column(name = "image_url")
    private String imageUrl;

    /** Preferred supplier for reordering this product. Nullable. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_supplier_id")
    private Supplier preferredSupplier;

    /** When false the product is archived and cannot be sold or ordered. */
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}