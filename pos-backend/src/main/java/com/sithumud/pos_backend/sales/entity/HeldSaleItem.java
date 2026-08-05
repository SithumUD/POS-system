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

/**
 * A single product line within a {@link HeldSale}.
 *
 * Price and name snapshots are stored so that if the product's price or name
 * changes while the cart is parked, the cart is still restored accurately.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "held_sale_items")
public class HeldSaleItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "held_sale_id", nullable = false)
    private HeldSale heldSale;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Snapshot of the product name at the time the cart was parked. */
    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    /** Snapshot of the product SKU at the time the cart was parked. */
    @Column(name = "product_sku_snapshot", length = 100)
    private String productSkuSnapshot;

    /** Selling price per unit at the time the cart was parked. */
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private Integer quantity;
}
