package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PurchaseOrder;
import com.sithumud.pos_backend.purchasing.entity.PurchaseOrderStatus;
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
public class PurchaseOrderDto {

    private UUID id;
    private String poNumber;
    private UUID supplierId;
    private String supplierName;
    private String branchSlug;
    private String branchName;
    private PurchaseOrderStatus status;
    private String notes;
    private String createdBy;
    private Instant createdAt;
    private Instant expectedAt;
    private BigDecimal totalAmount;
    private List<PurchaseOrderItemDto> items;
    private List<PurchaseOrderEventDto> events;

    public static PurchaseOrderDto fromEntity(PurchaseOrder po) {
        if (po == null) {
            return null;
        }

        List<PurchaseOrderItemDto> itemDtos = (po.getItems() != null) ? po.getItems().stream()
                .map(PurchaseOrderItemDto::fromEntity)
                .collect(Collectors.toList()) : List.of();

        List<PurchaseOrderEventDto> eventDtos = (po.getEvents() != null) ? po.getEvents().stream()
                .map(PurchaseOrderEventDto::fromEntity)
                .collect(Collectors.toList()) : List.of();

        BigDecimal total = itemDtos.stream()
                .map(item -> item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return PurchaseOrderDto.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier() != null ? po.getSupplier().getId() : null)
                .supplierName(po.getSupplier() != null ? po.getSupplier().getName() : null)
                .branchSlug(po.getBranch() != null ? po.getBranch().getSlug() : null)
                .branchName(po.getBranch() != null ? po.getBranch().getName() : null)
                .status(po.getStatus())
                .notes(po.getNotes())
                .createdBy(po.getCreatedBy() != null ? po.getCreatedBy().getName() : "System")
                .createdAt(po.getCreatedAt())
                .expectedAt(po.getExpectedAt())
                .totalAmount(total)
                .items(itemDtos)
                .events(eventDtos)
                .build();
    }
}
