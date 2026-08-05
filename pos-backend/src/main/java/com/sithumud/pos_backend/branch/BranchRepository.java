package com.sithumud.pos_backend.branch;

import com.sithumud.pos_backend.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID>, JpaSpecificationExecutor<Branch> {

    Optional<Branch> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
