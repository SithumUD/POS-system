package com.sithumud.pos_backend.common.audit;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.common.entity.BaseEntity;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // e.g. "PRICE_CHANGED", "SALE_VOIDED", "STOCK_ADJUSTED"
    @Column(nullable = false)
    private String action;

    // e.g. "Product", "Sale"
    @Column(nullable = false)
    private String entity;

    @Column(name = "entity_id")
    private String entityId;

    // Freeform JSON string of extra context (old value / new value, etc.)
    @Column(columnDefinition = "TEXT")
    private String metadata;
}