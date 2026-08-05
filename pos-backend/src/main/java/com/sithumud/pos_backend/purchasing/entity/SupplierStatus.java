package com.sithumud.pos_backend.purchasing.entity;

public enum SupplierStatus {
    /** Supplier is active and can receive purchase orders. */
    ACTIVE,
    /** Temporarily paused — e.g. during a pricing dispute. */
    ON_HOLD,
    /** Supplier is no longer used; archived. */
    INACTIVE
}
