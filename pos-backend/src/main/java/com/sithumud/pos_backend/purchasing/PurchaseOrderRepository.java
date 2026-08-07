package com.sithumud.pos_backend.purchasing;

import com.sithumud.pos_backend.purchasing.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, UUID>, JpaSpecificationExecutor<PurchaseOrder> {

    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    boolean existsByPoNumber(String poNumber);

    @Query("SELECT DISTINCT po FROM PurchaseOrder po LEFT JOIN FETCH po.items LEFT JOIN FETCH po.supplier LEFT JOIN FETCH po.branch WHERE po.id = :id")
    Optional<PurchaseOrder> findByIdWithDetails(@Param("id") UUID id);
}
