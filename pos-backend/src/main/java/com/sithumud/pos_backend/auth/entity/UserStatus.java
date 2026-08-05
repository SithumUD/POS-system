package com.sithumud.pos_backend.auth.entity;

public enum UserStatus {
    /** User account is active and can log in. */
    ACTIVE,
    /** Account is suspended — login is blocked but data is retained. */
    SUSPENDED,
    /** Invitation sent; user has not yet set their password. */
    INVITED
}
