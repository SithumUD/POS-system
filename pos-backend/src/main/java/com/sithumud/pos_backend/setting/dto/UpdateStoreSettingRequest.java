package com.sithumud.pos_backend.setting.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateStoreSettingRequest {

    private String storeName;
    private String legalName;
    private String currency;
    private BigDecimal taxRate;
    private String taxLabel;
    private String receiptFooter;
    private String timezone;
    private Integer lowStockThreshold;
    private BigDecimal maxDiscountPercent;
    private Boolean requireManagerApproval;
    private Boolean allowNegativeStock;
    private Boolean autoPrintReceipt;
    private BigDecimal roundCashTo;
    private Boolean emailAlerts;
    private String alertSensitivity;
    private Integer sessionTimeoutMinutes;
    private Boolean twoFactor;
}
