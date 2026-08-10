package com.sithumud.pos_backend.tenant.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a business/subscriber in the multi-tenant SaaS architecture.
 * This entity does NOT extend BaseEntity because it is the root of the tenant hierarchy,
 * and it does not have a @TenantId itself.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tenants")
@EntityListeners(AuditingEntityListener.class)
public class Tenant {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column
    private String businessAddress;

    @Column
    private String businessPhone;

    @Column(nullable = false)
    private String contactEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PlanType plan = PlanType.STARTER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'ACTIVE'")
    @Builder.Default
    private TenantStatus status = TenantStatus.INVITED;

    // Subscription Limits (denormalized from plan for custom Enterprise deals)
    @Column(nullable = false)
    @Builder.Default
    private Integer maxBranches = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxUsers = 3;

    @Column(nullable = false)
    @Builder.Default
    private Integer maxProducts = 5000;

    /** One-time token sent in the signup invitation email — expires after 72 hours. */
    @Column(unique = true)
    private String signupToken;

    @Column
    private Instant signupTokenExpiresAt;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
