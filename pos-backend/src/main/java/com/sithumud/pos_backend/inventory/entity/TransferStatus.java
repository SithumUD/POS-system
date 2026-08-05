package com.sithumud.pos_backend.inventory.entity;

public enum TransferStatus {
    /** Stock has left the source branch but not yet confirmed at destination. */
    IN_TRANSIT,
    /** Destination branch has confirmed receipt of all items. */
    COMPLETED,
    /** Transfer was cancelled before dispatch or during transit. */
    CANCELLED
}
