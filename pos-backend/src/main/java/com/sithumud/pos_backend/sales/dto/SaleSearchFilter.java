package com.sithumud.pos_backend.sales.dto;

import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleSearchFilter {

    private String search; // Receipt number or note keyword
    private String branchSlug;
    private UUID cashierId;
    private PaymentMethod paymentMethod;
    private SaleStatus status;
    private Instant startDate;
    private Instant endDate;
}
