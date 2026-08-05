package com.sithumud.pos_backend.sales.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
 * Represents one payment leg in a sale.
 * A SPLIT payment is stored as two rows: one CASH leg and one CARD leg,
 * each with its own {@code amount}.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentMethod method;

    /** Amount tendered / charged for this payment leg. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /**
     * Cash amount the customer handed over.
     * Only set for CASH legs — the change due = tenderedAmount − amount.
     * Null for CARD legs.
     */
    @Column(name = "tendered_amount", precision = 12, scale = 2)
    private BigDecimal tenderedAmount;
}