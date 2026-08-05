package com.sithumud.pos_backend.inventory;

import com.sithumud.pos_backend.inventory.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID>, JpaSpecificationExecutor<StockMovement> {
    List<StockMovement> findByReferenceId(String referenceId);
}
