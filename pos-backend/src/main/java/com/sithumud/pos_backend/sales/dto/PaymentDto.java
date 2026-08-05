package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.Payment;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
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
public class PaymentDto {

    private UUID id;
    private PaymentMethod method;
    private BigDecimal amount;
    private BigDecimal tenderedAmount;

    public static PaymentDto fromEntity(Payment payment) {
        if (payment == null) {
            return null;
        }
        return PaymentDto.builder()
                .id(payment.getId())
                .method(payment.getMethod())
                .amount(payment.getAmount())
                .tenderedAmount(payment.getTenderedAmount())
                .build();
    }
}
