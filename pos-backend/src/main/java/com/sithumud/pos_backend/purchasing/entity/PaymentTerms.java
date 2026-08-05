package com.sithumud.pos_backend.purchasing.entity;

public enum PaymentTerms {
    /** Invoice due within 7 days of delivery. */
    NET_7,
    /** Invoice due within 15 days of delivery. */
    NET_15,
    /** Invoice due within 30 days of delivery. */
    NET_30,
    /** Invoice due within 45 days of delivery. */
    NET_45,
    /** Payment collected on delivery. */
    CASH_ON_DELIVERY
}
