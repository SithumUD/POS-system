package com.sithumud.pos_backend.sales.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import com.sithumud.pos_backend.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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
@Table(name = "sale_items")
public class SaleItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Snapshot of the product name at the time of sale.
     * Ensures receipts are historically accurate even if the product is
     * renamed or deleted after the transaction.
     */
    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    /**
     * Snapshot of the product SKU at the time of sale.
     * Preserves the SKU on the receipt for support and return lookups.
     */
    @Column(name = "product_sku_snapshot", length = 100)
    private String productSkuSnapshot;

    @Column(nullable = false)
    private Integer quantity;

    // Snapshot of the price at the moment of sale — never re-read
    // Product.unitPrice afterwards, since prices change over time.
    @Column(name = "unit_price_at_sale", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPriceAtSale;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
}