package com.sithumud.pos_backend.tenant;

import com.sithumud.pos_backend.tenant.entity.Tenant;
import com.sithumud.pos_backend.tenant.entity.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    boolean existsByContactEmail(String email);
    Optional<Tenant> findFirstByContactEmail(String email);
    Optional<Tenant> findBySignupToken(String signupToken);
    List<Tenant> findAllByOrderByCreatedAtDesc();
    List<Tenant> findAllByStatusOrderByCreatedAtDesc(TenantStatus status);
}
