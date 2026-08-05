package com.sithumud.pos_backend.product.entity;

public enum UnitOfMeasure {
    /** Individual piece/unit — generic fallback. */
    EACH,
    /** Piece — same as EACH, common in retail. */
    PCS,
    /** Kilogram. */
    KG,
    /** Gram. */
    G,
    /** Litre. */
    L,
    /** Millilitre. */
    ML,
    /** Bottle (liquid retail, e.g. beverages). */
    BOTTLE,
    /** Box / carton. */
    BOX,
    /** Pack / multi-unit shrink-wrap. */
    PACK,
    /** Dozen (12 units). */
    DOZEN
}