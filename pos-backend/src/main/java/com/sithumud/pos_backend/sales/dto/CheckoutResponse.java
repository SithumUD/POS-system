package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutResponse {

    private UUID saleId;
    private String receiptNumber;
    private String idempotencyKey;
    private Instant soldAt;
    private SaleStatus status;
    private String branchSlug;
    private String cashierName;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal tendered;
    private BigDecimal changeDue;
    private List<SaleItemDto> items;
    private List<PaymentDto> payments;
}
