package com.sithumud.pos_backend.inventory.dto;

import com.sithumud.pos_backend.inventory.entity.StockMovementType;
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
public class StockMovementSearchFilter {

    private UUID productId;
    private String branchSlug;
    private StockMovementType type;
    private String referenceId;
    private Instant startDate;
    private Instant endDate;
}
