package com.sithumud.pos_backend.inventory.entity;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import com.sithumud.pos_backend.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Append-only stock ledger entry.
 *
 * Every change to stock quantity — from a sale, purchase receipt, manual adjustment,
 * inter-branch transfer, void, or customer return — creates one row here.
 * Rows are NEVER updated or deleted.
 *
 * {@link Inventory#quantityOnHand} is a cached snapshot of the running total
 * of this table. It is updated atomically alongside each new ledger entry.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "stock_movements", indexes = {
        @Index(name = "idx_stock_movement_product_branch", columnList = "product_id, branch_id"),
        @Index(name = "idx_stock_movement_reference", columnList = "reference_id")
})
public class StockMovement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockMovementType type;

    /**
     * Signed quantity delta.
     * Positive = stock increased (PURCHASE, TRANSFER_IN, RETURN).
     * Negative = stock decreased (SALE, TRANSFER_OUT, VOID).
     */
    @Column(nullable = false)
    private Integer quantity;

    /**
     * Business reference that caused this movement.
     * Examples: "SALE-10493", "PO-2043", "TRF-0338", "ADJ-001".
     * Enables tracing any ledger entry back to its originating document.
     */
    @Column(name = "reference_id", length = 50)
    private String referenceId;

    /**
     * Free-text note describing the reason for the movement.
     * Examples: "Card payment · Terminal 1", "Damaged on shelf — write-off".
     */
    @Column(columnDefinition = "TEXT")
    private String note;

    /**
     * User who triggered this movement.
     * Null for system-generated movements (e.g. automated sale processing).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}