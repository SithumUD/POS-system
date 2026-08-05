package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PaymentTerms;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSupplierRequest {

    @NotBlank(message = "Supplier company name is required")
    private String name;

    private String contactPerson;

    private String phone;

    @Email(message = "Invalid email format")
    private String contactEmail;

    private String address;

    private PaymentTerms paymentTerms;

    @Min(value = 0, message = "Lead time days must be non-negative")
    private Integer leadTimeDays;

    private String notes;

    private List<String> suppliedCategories;
}
