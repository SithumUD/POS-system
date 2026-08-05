package com.sithumud.pos_backend.sales;

import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SaleRepository extends JpaRepository<Sale, UUID>, JpaSpecificationExecutor<Sale> {

    Optional<Sale> findByIdempotencyKey(String idempotencyKey);

    Optional<Sale> findByReceiptNumber(String receiptNumber);

    boolean existsByIdempotencyKey(String idempotencyKey);

    boolean existsByReceiptNumber(String receiptNumber);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.items LEFT JOIN FETCH s.payments LEFT JOIN FETCH s.branch LEFT JOIN FETCH s.cashier WHERE s.id = :id")
    Optional<Sale> findByIdWithDetails(@Param("id") UUID id);

    List<Sale> findByBranchSlugAndStatusAndCreatedAtBetween(String branchSlug, SaleStatus status, Instant startDate, Instant endDate);

    List<Sale> findByStatusAndCreatedAtBetween(SaleStatus status, Instant startDate, Instant endDate);
}
