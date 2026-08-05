package com.sithumud.pos_backend.product.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_category_slug", columnList = "slug", unique = true)
})
public class Category extends BaseEntity {

    @NotBlank
    @Column(nullable = false)
    private String name;

    /**
     * URL/code-safe slug for the category.
     * Example: "beverages", "soft-drinks".
     */
    @Column(length = 100, unique = true)
    private String slug;

    /**
     * Self-referencing FK — supports one level of sub-categories.
     * Null = top-level category (e.g. "Beverages").
     * Non-null = sub-category (e.g. "Soft Drinks" under "Beverages").
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    /**
     * Controls the order in which categories appear in the UI.
     * Lower number = displayed first.
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;
}