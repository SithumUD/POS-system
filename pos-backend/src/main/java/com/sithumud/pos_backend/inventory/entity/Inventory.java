package com.sithumud.pos_backend.inventory.entity;

import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import com.sithumud.pos_backend.product.entity.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "inventory", uniqueConstraints = {
        @UniqueConstraint(name = "uq_inventory_product_branch", columnNames = {"product_id", "branch_id"})
})
public class Inventory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Column(name = "quantity_on_hand", nullable = false)
    @Builder.Default
    private Integer quantityOnHand = 0;

    // Optimistic locking — this is what stops two terminals from both
    // successfully selling the same last unit of stock at the same time.
    @Version
    private Long version;
}