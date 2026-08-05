package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySku(String sku);

    Optional<Product> findByBarcode(String barcode);

    boolean existsBySku(String sku);

    boolean existsByBarcode(String barcode);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.preferredSupplier WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") UUID id);
}
