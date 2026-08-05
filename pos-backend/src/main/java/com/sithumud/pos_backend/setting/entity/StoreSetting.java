package com.sithumud.pos_backend.setting.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
@Entity
@Table(name = "store_settings")
public class StoreSetting extends BaseEntity {

    @Column(nullable = false)
    @Builder.Default
    private String storeName = "RetailOS POS";

    @Column(nullable = false)
    @Builder.Default
    private String legalName = "Sathosa Group (Pvt) Ltd";

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "LKR";

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("10.00");

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String taxLabel = "VAT";

    @Column
    @Builder.Default
    private String receiptFooter = "Thank you for shopping with us! Please come again.";

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String timezone = "Asia/Colombo";

    @Column(nullable = false)
    @Builder.Default
    private Integer lowStockThreshold = 12;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal maxDiscountPercent = new BigDecimal("10.00");

    @Column(nullable = false)
    @Builder.Default
    private Boolean requireManagerApproval = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean allowNegativeStock = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean autoPrintReceipt = true;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal roundCashTo = new BigDecimal("1.00");

    @Column(nullable = false)
    @Builder.Default
    private Boolean emailAlerts = true;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String alertSensitivity = "BALANCED";

    @Column(nullable = false)
    @Builder.Default
    private Integer sessionTimeoutMinutes = 30;

    @Column(nullable = false)
    @Builder.Default
    private Boolean twoFactor = false;
}
