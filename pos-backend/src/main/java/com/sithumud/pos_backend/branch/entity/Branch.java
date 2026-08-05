package com.sithumud.pos_backend.branch.entity;

import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "branches", indexes = {
        @Index(name = "idx_branch_slug", columnList = "slug", unique = true)
})
public class Branch extends BaseEntity {

    /**
     * URL-safe, human-readable identifier used in API paths and cross-entity references.
     * Example: "colombo", "kandy-city". Must be unique.
     */
    @NotBlank
    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    /** Full display name shown in the UI. Example: "Colombo – Main Branch". */
    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Abbreviated name for compact / mobile UI. Example: "Colombo – Main". */
    @Column(name = "short_name")
    private String shortName;

    @Column
    private String address;

    @Column(length = 30)
    private String phone;

    /**
     * Designated branch manager.
     * Nullable — a branch may not have a manager assigned yet.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private User manager;

    /** Opening time in HH:MM format (24h). Example: "07:30". */
    @Column(name = "opens_at", length = 5)
    private String opensAt;

    /** Closing time in HH:MM format (24h). Example: "22:00". */
    @Column(name = "closes_at", length = 5)
    private String closesAt;

    /** Number of active POS terminals in this branch. */
    @Column(name = "terminal_count")
    @Builder.Default
    private Integer terminalCount = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private BranchStatus status = BranchStatus.SETUP;
}