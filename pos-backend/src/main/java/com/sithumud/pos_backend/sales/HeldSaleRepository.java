package com.sithumud.pos_backend.sales;

import com.sithumud.pos_backend.sales.entity.HeldSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HeldSaleRepository extends JpaRepository<HeldSale, UUID> {

    List<HeldSale> findAllByBranchIdOrderByHeldAtDesc(UUID branchId);

    List<HeldSale> findAllByBranchSlugOrderByHeldAtDesc(String branchSlug);
}
