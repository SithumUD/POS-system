package com.sithumud.pos_backend.auth.entity;

import com.sithumud.pos_backend.branch.entity.Branch;
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
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email", unique = true)
})
public class User extends BaseEntity {

    /** Full display name shown in the UI and on receipts. */
    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Login email — unique across the system. */
    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt-hashed password. Never store plain-text passwords. */
    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    /**
     * The branch this user is assigned to.
     * Null for ADMIN users who have access to all branches.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    /**
     * Account lifecycle status.
     * Replaces the old {@code isActive} boolean with a richer three-state model:
     * INVITED → ACTIVE (after password set) or SUSPENDED (by an admin).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.INVITED;

    /**
     * Timestamp of the most recent authenticated activity.
     * Updated on every successful API request via a Spring Security filter.
     * Null until the user logs in for the first time.
     */
    @Column(name = "last_active_at")
    private Instant lastActiveAt;

    @Column(name = "avatar_url")
    private String avatarUrl;
}