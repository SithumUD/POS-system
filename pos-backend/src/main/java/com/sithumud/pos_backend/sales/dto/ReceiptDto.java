package com.sithumud.pos_backend.sales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptDto {

    private String storeName;
    private String legalName;
    private String branchName;
    private String branchAddress;
    private String branchPhone;
    private String receiptNumber;
    private String cashierName;
    private Instant soldAt;
    private List<SaleItemDto> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private List<PaymentDto> payments;
    private BigDecimal tendered;
    private BigDecimal changeDue;
    private String receiptFooter;
    private String formattedThermalText;
}
