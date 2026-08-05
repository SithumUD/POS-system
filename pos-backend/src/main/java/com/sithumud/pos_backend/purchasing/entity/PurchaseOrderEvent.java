package com.sithumud.pos_backend.purchasing.entity;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Immutable audit trail entry for a Purchase Order.
 * Records every meaningful state change or user action on a PO.
 * Rows in this table are never updated or deleted.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "purchase_order_events")
public class PurchaseOrderEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    /** Human-readable description of the event. Example: "Purchase order created". */
    @NotBlank
    @Column(nullable = false)
    private String description;

    /**
     * When the event actually occurred.
     * Stored explicitly (not relying on createdAt) because events can be
     * imported or back-dated from external supplier systems.
     */
    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    /**
     * The user who triggered this event.
     * Nullable — system-generated events (e.g. auto-close after full receipt)
     * have no human actor.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;
}
