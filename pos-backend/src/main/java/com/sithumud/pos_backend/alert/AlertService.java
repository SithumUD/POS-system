package com.sithumud.pos_backend.alert;

import com.sithumud.pos_backend.alert.dto.AlertSearchFilter;
import com.sithumud.pos_backend.alert.dto.AnomalyAlertDto;
import com.sithumud.pos_backend.alert.dto.ScanSummaryDto;
import com.sithumud.pos_backend.alert.entity.AlertSeverity;
import com.sithumud.pos_backend.alert.entity.AlertStatus;
import com.sithumud.pos_backend.alert.entity.AlertType;
import com.sithumud.pos_backend.alert.entity.AnomalyAlert;
import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.inventory.InventoryRepository;
import com.sithumud.pos_backend.inventory.StockMovementRepository;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.inventory.entity.StockMovement;
import com.sithumud.pos_backend.inventory.entity.StockMovementType;
import com.sithumud.pos_backend.sales.SaleRepository;
import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AnomalyAlertRepository alertRepository;
    private final SaleRepository saleRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryRepository inventoryRepository;
    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public Page<AnomalyAlertDto> getAlerts(AlertSearchFilter filter, Pageable pageable) {
        Specification<AnomalyAlert> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getBranchSlug())) {
                predicates.add(cb.equal(root.get("branch").get("slug"), filter.getBranchSlug()));
            }

            if (filter.getSeverity() != null) {
                predicates.add(cb.equal(root.get("severity"), filter.getSeverity()));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("type"), filter.getType()));
            }

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(titleLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AnomalyAlert> page = alertRepository.findAll(spec, pageable);
        List<AnomalyAlertDto> dtos = page.getContent().stream().map(AnomalyAlertDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AnomalyAlertDto getAlertById(UUID id) {
        AnomalyAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ALERT_NOT_FOUND", "Anomaly alert not found: " + id));

        return AnomalyAlertDto.fromEntity(alert);
    }

    @Transactional
    public AnomalyAlertDto updateStatus(UUID id, AlertStatus status) {
        AnomalyAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ALERT_NOT_FOUND", "Anomaly alert not found: " + id));

        alert.setStatus(status);
        AnomalyAlert saved = alertRepository.save(alert);
        return AnomalyAlertDto.fromEntity(saved);
    }

    @Transactional
    public AnomalyAlertDto addNote(UUID id, String note) {
        AnomalyAlert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "ALERT_NOT_FOUND", "Anomaly alert not found: " + id));

        alert.getInvestigationNotes().add(Instant.now() + ": " + note.trim());
        if (alert.getStatus() == AlertStatus.NEW) {
            alert.setStatus(AlertStatus.INVESTIGATING);
        }

        AnomalyAlert saved = alertRepository.save(alert);
        return AnomalyAlertDto.fromEntity(saved);
    }

    @Transactional
    public ScanSummaryDto runHeuristicScan() {
        List<AnomalyAlert> generated = new ArrayList<>();
        Instant past24h = Instant.now().minus(24, ChronoUnit.HOURS);
        Branch defaultBranch = branchRepository.findAll().stream().findFirst().orElse(null);

        // 1. Elevated Voids Heuristic
        List<Sale> voidedSales = saleRepository.findByStatusAndCreatedAtBetween(SaleStatus.VOIDED, past24h, Instant.now());
        if (voidedSales.size() >= 2) {
            String title = "Elevated Voided Sales Activity";
            if (!alertRepository.existsByTitle(title)) {
                String desc = String.format("Detected %d voided transactions in the last 24 hours.", voidedSales.size());
                Branch b = (voidedSales.isEmpty() || voidedSales.get(0).getBranch() == null) ? defaultBranch : voidedSales.get(0).getBranch();
                AnomalyAlert voidAlert = AnomalyAlert.builder()
                        .type(AlertType.ELEVATED_VOIDS)
                        .severity(AlertSeverity.HIGH)
                        .status(AlertStatus.NEW)
                        .title(title)
                        .description(desc)
                        .explanation(desc)
                        .branch(b)
                        .detectedAt(Instant.now())
                        .build();
                generated.add(alertRepository.save(voidAlert));
            }
        }

        // 2. Limit-Hugging Discounts Heuristic
        List<Sale> completedSales = saleRepository.findByStatusAndCreatedAtBetween(SaleStatus.COMPLETED, past24h, Instant.now());
        long maxDiscountCount = completedSales.stream()
                .filter(s -> s.getDiscount() != null && s.getDiscount().compareTo(new BigDecimal("500.00")) >= 0)
                .count();

        if (maxDiscountCount >= 2) {
            String title = "Limit-Hugging Cashier Discounting";
            if (!alertRepository.existsByTitle(title)) {
                String desc = String.format("Detected %d transactions with maximum threshold discounts applied.", maxDiscountCount);
                Branch b = (completedSales.isEmpty() || completedSales.get(0).getBranch() == null) ? defaultBranch : completedSales.get(0).getBranch();
                AnomalyAlert discountAlert = AnomalyAlert.builder()
                        .type(AlertType.LIMIT_HUGGING_DISCOUNTS)
                        .severity(AlertSeverity.MEDIUM)
                        .status(AlertStatus.NEW)
                        .title(title)
                        .description(desc)
                        .explanation(desc)
                        .branch(b)
                        .detectedAt(Instant.now())
                        .build();
                generated.add(alertRepository.save(discountAlert));
            }
        }

        // 3. Stock Write-Offs Heuristic
        List<StockMovement> movements = stockMovementRepository.findAll();
        long removeCount = movements.stream()
                .filter(m -> m.getType() == StockMovementType.ADJUSTMENT)
                .filter(m -> Math.abs(m.getQuantity()) >= 10)
                .count();

        if (removeCount >= 1) {
            String title = "Elevated Inventory Stock Write-Offs";
            if (!alertRepository.existsByTitle(title)) {
                String desc = String.format("Detected %d large manual stock removal/correction adjustments.", removeCount);
                Branch b = (movements.isEmpty() || movements.get(0).getBranch() == null) ? defaultBranch : movements.get(0).getBranch();
                AnomalyAlert stockAlert = AnomalyAlert.builder()
                        .type(AlertType.STOCK_WRITE_OFFS)
                        .severity(AlertSeverity.HIGH)
                        .status(AlertStatus.NEW)
                        .title(title)
                        .description(desc)
                        .explanation(desc)
                        .branch(b)
                        .detectedAt(Instant.now())
                        .build();
                generated.add(alertRepository.save(stockAlert));
            }
        }

        // 4. Zero-Stock Fast Movers Heuristic
        List<Inventory> zeroInventories = inventoryRepository.findAll().stream()
                .filter(i -> i.getQuantityOnHand() <= 0)
                .collect(Collectors.toList());

        if (!zeroInventories.isEmpty()) {
            String title = "Zero-Stock Fast Mover Depletion";
            if (!alertRepository.existsByTitle(title)) {
                String desc = String.format("Detected %d products with zero stock balance across branches.", zeroInventories.size());
                Branch b = (zeroInventories.isEmpty() || zeroInventories.get(0).getBranch() == null) ? defaultBranch : zeroInventories.get(0).getBranch();
                AnomalyAlert zeroStockAlert = AnomalyAlert.builder()
                        .type(AlertType.ZERO_STOCK_FAST_MOVERS)
                        .severity(AlertSeverity.MEDIUM)
                        .status(AlertStatus.NEW)
                        .title(title)
                        .description(desc)
                        .explanation(desc)
                        .branch(b)
                        .detectedAt(Instant.now())
                        .build();
                generated.add(alertRepository.save(zeroStockAlert));
            }
        }

        List<AnomalyAlertDto> dtos = generated.stream().map(AnomalyAlertDto::fromEntity).collect(Collectors.toList());
        return ScanSummaryDto.builder()
                .scannedAt(Instant.now())
                .newAlertsGenerated(generated.size())
                .alerts(dtos)
                .build();
    }
}
