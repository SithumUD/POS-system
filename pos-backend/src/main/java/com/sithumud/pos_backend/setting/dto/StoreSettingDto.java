package com.sithumud.pos_backend.setting.dto;

import com.sithumud.pos_backend.setting.entity.StoreSetting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreSettingDto {

    private UUID id;
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

    public static StoreSettingDto fromEntity(StoreSetting setting) {
        if (setting == null) return null;

        return StoreSettingDto.builder()
                .id(setting.getId())
                .storeName(setting.getStoreName())
                .legalName(setting.getLegalName())
                .currency(setting.getCurrency())
                .taxRate(setting.getTaxRate())
                .taxLabel(setting.getTaxLabel())
                .receiptFooter(setting.getReceiptFooter())
                .timezone(setting.getTimezone())
                .lowStockThreshold(setting.getLowStockThreshold())
                .maxDiscountPercent(setting.getMaxDiscountPercent())
                .requireManagerApproval(setting.getRequireManagerApproval())
                .allowNegativeStock(setting.getAllowNegativeStock())
                .autoPrintReceipt(setting.getAutoPrintReceipt())
                .roundCashTo(setting.getRoundCashTo())
                .emailAlerts(setting.getEmailAlerts())
                .alertSensitivity(setting.getAlertSensitivity())
                .sessionTimeoutMinutes(setting.getSessionTimeoutMinutes())
                .twoFactor(setting.getTwoFactor())
                .build();
    }
}
