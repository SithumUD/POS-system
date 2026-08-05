package com.sithumud.pos_backend.setting.entity;

public enum AlertSensitivity {
    /** Fewer alerts — only the most statistically significant anomalies are raised. */
    LOW,
    /** Balanced threshold — recommended default. */
    BALANCED,
    /** More aggressive — surface borderline anomalies; may increase false positives. */
    HIGH
}
