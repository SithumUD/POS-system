package com.sithumud.pos_backend.product;

import com.sithumud.pos_backend.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    List<Category> findAllByParentIsNullOrderByDisplayOrderAsc();

    List<Category> findAllByParentIdOrderByDisplayOrderAsc(UUID parentId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.category = :category OR p.category.parent = :category")
    long countProductsByCategory(@Param("category") Category category);
}
