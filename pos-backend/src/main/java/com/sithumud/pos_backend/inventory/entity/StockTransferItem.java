package com.sithumud.pos_backend.inventory.entity;

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

/**
 * A single product line within a {@link StockTransfer}.
 *
 * Name and SKU snapshots are stored for audit purposes — they preserve what
 * the product was called at the time of transfer even if it is renamed later.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock_transfer_items")
public class StockTransferItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transfer_id", nullable = false)
    private StockTransfer transfer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /** Snapshot of the product name at the time the transfer was created. */
    @Column(name = "product_name_snapshot", nullable = false)
    private String productNameSnapshot;

    /** Snapshot of the product SKU at the time the transfer was created. */
    @Column(name = "product_sku_snapshot", length = 100)
    private String productSkuSnapshot;

    /** Number of units being transferred. Always positive. */
    @Column(nullable = false)
    private Integer quantity;
}
