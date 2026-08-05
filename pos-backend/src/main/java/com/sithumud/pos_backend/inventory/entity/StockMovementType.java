package com.sithumud.pos_backend.inventory.entity;

public enum StockMovementType {
    /** Stock reduced due to a completed sale. */
    SALE,
    /** Stock added from a received purchase order. */
    PURCHASE,
    /** Manual correction — e.g. recount, damage write-off. */
    ADJUSTMENT,
    /** Stock moved in from another branch. */
    TRANSFER_IN,
    /** Stock moved out to another branch. */
    TRANSFER_OUT,
    /** Sale was voided; stock returned to shelf. */
    VOID,
    /** Customer return processed; stock added back. */
    RETURN
}