package com.sithumud.pos_backend.inventory;

import com.sithumud.pos_backend.inventory.entity.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, UUID>, JpaSpecificationExecutor<StockTransfer> {

    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    boolean existsByTransferNumber(String transferNumber);

    @Query("SELECT st FROM StockTransfer st LEFT JOIN FETCH st.items LEFT JOIN FETCH st.fromBranch LEFT JOIN FETCH st.toBranch WHERE st.id = :id")
    Optional<StockTransfer> findByIdWithDetails(@Param("id") UUID id);
}
