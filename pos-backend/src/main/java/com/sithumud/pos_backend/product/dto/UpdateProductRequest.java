package com.sithumud.pos_backend.product.dto;

import com.sithumud.pos_backend.product.entity.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {

    @NotBlank(message = "Product SKU is required")
    private String sku;

    private String barcode;

    @NotBlank(message = "Product name is required")
    private String name;

    private UUID categoryId;

    @NotNull(message = "Selling price is required")
    @PositiveOrZero(message = "Selling price must be non-negative")
    private BigDecimal price;

    @NotNull(message = "Cost price is required")
    @PositiveOrZero(message = "Cost price must be non-negative")
    private BigDecimal cost;

    @PositiveOrZero(message = "Tax rate must be non-negative")
    private BigDecimal taxRate;

    @PositiveOrZero(message = "Reorder threshold must be non-negative")
    private Integer threshold;

    private UnitOfMeasure unitOfMeasure;

    private String unit;

    private String imageUrl;

    private UUID supplierId;

    private Boolean active;
}
