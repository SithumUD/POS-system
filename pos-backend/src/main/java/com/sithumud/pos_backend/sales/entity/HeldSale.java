package com.sithumud.pos_backend.sales.entity;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A parked / held cart — a cart that has been saved mid-transaction so the
 * cashier can serve another customer and then resume it later.
 *
 * Held sales are deliberately kept separate from the Sale entity so that the
 * sales ledger only ever contains completed, voided, or refunded transactions.
 * When a held sale is resumed and paid, a new Sale is created and this record
 * is deleted.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "held_sales")
public class HeldSale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    /** Cashier who parked the cart. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cashier_id", nullable = false)
    private User cashier;

    /**
     * Identifier of the POS terminal where the cart was parked.
     * Nullable — carts can be resumed from a different terminal.
     */
    @Column(name = "terminal_id", length = 50)
    private String terminalId;

    /**
     * User-assigned label to identify the cart at a glance.
     * Example: "Table 3", "Customer – Smith".
     */
    @Column(length = 100)
    private String label;

    /** Discount amount applied to the held cart. */
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    /** Exact instant when the cashier parked this cart. */
    @Column(name = "held_at", nullable = false)
    private Instant heldAt;

    @OneToMany(mappedBy = "heldSale", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HeldSaleItem> items = new ArrayList<>();

    public void addItem(HeldSaleItem item) {
        items.add(item);
        item.setHeldSale(this);
    }
}
