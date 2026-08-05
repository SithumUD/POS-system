package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.StockTransfer;
import com.sithumud.pos_backend.inventory.entity.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransferDto {

    private UUID id;
    private String transferNumber;
    private String fromBranchSlug;
    private String fromBranchName;
    private String toBranchSlug;
    private String toBranchName;
    private TransferStatus status;
    private String note;
    private String createdBy;
    private Instant createdAt;
    private Instant completedAt;
    private List<StockTransferItemDto> items;

    public static StockTransferDto fromEntity(StockTransfer transfer) {
        if (transfer == null) {
            return null;
        }

        List<StockTransferItemDto> itemDtos = (transfer.getItems() != null) ? transfer.getItems().stream()
                .map(StockTransferItemDto::fromEntity)
                .collect(Collectors.toList()) : List.of();

        return StockTransferDto.builder()
                .id(transfer.getId())
                .transferNumber(transfer.getTransferNumber())
                .fromBranchSlug(transfer.getFromBranch() != null ? transfer.getFromBranch().getSlug() : null)
                .fromBranchName(transfer.getFromBranch() != null ? transfer.getFromBranch().getName() : null)
                .toBranchSlug(transfer.getToBranch() != null ? transfer.getToBranch().getSlug() : null)
                .toBranchName(transfer.getToBranch() != null ? transfer.getToBranch().getName() : null)
                .status(transfer.getStatus())
                .note(transfer.getNote())
                .createdBy(transfer.getCreatedBy() != null ? transfer.getCreatedBy().getName() : "System")
                .createdAt(transfer.getCreatedAt())
                .completedAt(transfer.getCompletedAt())
                .items(itemDtos)
                .build();
    }
}
