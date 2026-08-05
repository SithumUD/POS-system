package com.sithumud.pos_backend.branch.entity;

public enum BranchStatus {
    /** Branch is operational and open for business. */
    OPEN,
    /** Branch is closed for the day (end-of-day). */
    CLOSED,
    /** Branch is being configured/set up and is not yet live. */
    SETUP
}
