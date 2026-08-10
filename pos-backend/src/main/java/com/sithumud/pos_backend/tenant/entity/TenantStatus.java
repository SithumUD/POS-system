package com.sithumud.pos_backend.tenant.entity;

public enum TenantStatus {
    /** Invitation sent; business owner has not yet completed the signup form. */
    INVITED,
    /** Signup form submitted; awaiting manual payment confirmation and super-admin approval. */
    PENDING_APPROVAL,
    /** Fully approved and active — users can log in and use the system. */
    ACTIVE,
    /** Manually suspended by super-admin (e.g., non-payment, abuse). */
    SUSPENDED
}
