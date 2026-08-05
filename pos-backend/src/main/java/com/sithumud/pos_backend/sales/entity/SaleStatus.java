package com.sithumud.pos_backend.sales.entity;

public enum SaleStatus {
    /** Normal, fully paid transaction. */
    COMPLETED,
    /** Cancelled before payment was finalised; stock is returned. */
    VOIDED,
    /** Payment was returned to the customer after completion. */
    REFUNDED
    // Note: parked/held carts are a separate HeldSale entity — they are not sales.
}