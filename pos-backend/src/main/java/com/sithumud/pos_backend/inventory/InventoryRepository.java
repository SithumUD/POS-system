package com.sithumud.pos_backend.inventory;

import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID>, JpaSpecificationExecutor<Inventory> {

    List<Inventory> findByProduct(Product product);

    List<Inventory> findByBranch(Branch branch);

    List<Inventory> findByProductId(UUID productId);

    Optional<Inventory> findByProductAndBranch(Product product, Branch branch);

    Optional<Inventory> findByProductIdAndBranchId(UUID productId, UUID branchId);

    Optional<Inventory> findByProductIdAndBranchSlug(UUID productId, String branchSlug);

    @Query("SELECT SUM(i.quantityOnHand) FROM Inventory i WHERE i.product.id = :productId")
    Integer getTotalStockByProductId(@Param("productId") UUID productId);
}
