package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.Sale;
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
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleDto {

    private UUID id;
    private String receiptNumber;
    private String branchSlug;
    private String branchName;
    private String cashierName;
    private String terminalId;
    private SaleStatus status;
    private Instant soldAt;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal tax;
    private BigDecimal total;
    private BigDecimal tendered;
    private BigDecimal changeDue;
    private PaymentMethod paymentMethod;
    private String note;
    private List<SaleItemDto> items;
    private List<PaymentDto> payments;

    public static SaleDto fromEntity(Sale sale) {
        if (sale == null) {
            return null;
        }

        List<SaleItemDto> itemDtos = (sale.getItems() != null) ? sale.getItems().stream()
                .map(SaleItemDto::fromEntity)
                .collect(Collectors.toList()) : List.of();

        List<PaymentDto> paymentDtos = (sale.getPayments() != null) ? sale.getPayments().stream()
                .map(PaymentDto::fromEntity)
                .collect(Collectors.toList()) : List.of();

        PaymentMethod primaryMethod = PaymentMethod.CASH;
        BigDecimal totalTendered = BigDecimal.ZERO;
        if (!paymentDtos.isEmpty()) {
            if (paymentDtos.size() > 1) {
                primaryMethod = PaymentMethod.SPLIT;
            } else {
                primaryMethod = paymentDtos.get(0).getMethod();
            }

            for (PaymentDto p : paymentDtos) {
                if (p.getTenderedAmount() != null) {
                    totalTendered = totalTendered.add(p.getTenderedAmount());
                } else if (p.getAmount() != null) {
                    totalTendered = totalTendered.add(p.getAmount());
                }
            }
        }

        BigDecimal changeDue = totalTendered.subtract(sale.getTotal());
        if (changeDue.compareTo(BigDecimal.ZERO) < 0) {
            changeDue = BigDecimal.ZERO;
        }

        return SaleDto.builder()
                .id(sale.getId())
                .receiptNumber(sale.getReceiptNumber())
                .branchSlug(sale.getBranch() != null ? sale.getBranch().getSlug() : null)
                .branchName(sale.getBranch() != null ? sale.getBranch().getName() : null)
                .cashierName(sale.getCashier() != null ? sale.getCashier().getName() : null)
                .terminalId(sale.getTerminalId())
                .status(sale.getStatus())
                .soldAt(sale.getSoldAt())
                .subtotal(sale.getSubtotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .total(sale.getTotal())
                .tendered(totalTendered)
                .changeDue(changeDue)
                .paymentMethod(primaryMethod)
                .note(sale.getNote())
                .items(itemDtos)
                .payments(paymentDtos)
                .build();
    }
}
