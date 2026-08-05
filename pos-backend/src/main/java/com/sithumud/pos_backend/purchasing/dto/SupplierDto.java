package com.sithumud.pos_backend.purchasing.dto;

import com.sithumud.pos_backend.purchasing.entity.PaymentTerms;
import com.sithumud.pos_backend.purchasing.entity.Supplier;
import com.sithumud.pos_backend.purchasing.entity.SupplierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDto {

    private UUID id;
    private String name;
    private String contactPerson;
    private String phone;
    private String contactEmail;
    private String address;
    private PaymentTerms paymentTerms;
    private Integer leadTimeDays;
    private SupplierStatus status;
    private String notes;
    private List<String> suppliedCategories;

    public static SupplierDto fromEntity(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        return SupplierDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .contactEmail(supplier.getContactEmail())
                .address(supplier.getAddress())
                .paymentTerms(supplier.getPaymentTerms())
                .leadTimeDays(supplier.getLeadTimeDays())
                .status(supplier.getStatus())
                .notes(supplier.getNotes())
                .suppliedCategories(supplier.getSuppliedCategories())
                .build();
    }
}
