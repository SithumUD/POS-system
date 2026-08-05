package com.sithumud.pos_backend.purchasing;

import com.sithumud.pos_backend.purchasing.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID>, JpaSpecificationExecutor<Supplier> {

    Optional<Supplier> findByName(String name);

    boolean existsByName(String name);
}
