package com.sithumud.pos_backend.purchasing.entity;

import com.sithumud.pos_backend.common.entity.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "suppliers", indexes = {
        @Index(name = "idx_supplier_name", columnList = "name")
})
public class Supplier extends BaseEntity {

    /** Company / trading name of the supplier. */
    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Name of the primary contact person at the supplier. */
    @Column(name = "contact_person")
    private String contactPerson;

    /** Contact phone number. */
    @Column(length = 30)
    private String phone;

    /** Contact email address used for purchase order communication. */
    @Email
    @Column(name = "contact_email")
    private String contactEmail;

    /** Physical / mailing address of the supplier. */
    @Column
    private String address;

    /**
     * Agreed payment terms for invoices from this supplier.
     * Used by accounts payable to calculate due dates.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_terms", length = 20)
    private PaymentTerms paymentTerms;

    /**
     * Average number of calendar days from order placement to delivery.
     * Used to auto-suggest the expected delivery date on a new PO.
     */
    @Min(0)
    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SupplierStatus status = SupplierStatus.ACTIVE;

    /** Free-text internal notes — delivery schedules, special instructions, etc. */
    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Category slugs that this supplier provides (e.g. ["beverages", "dairy"]).
     * Stored as a simple string collection — not normalised, as categories rarely
     * change and this avoids a heavy JOIN on the supplier list screen.
     */
    @ElementCollection
    @CollectionTable(name = "supplier_categories", joinColumns = @JoinColumn(name = "supplier_id"))
    @Column(name = "category_slug", length = 100)
    @Builder.Default
    private List<String> suppliedCategories = new ArrayList<>();
}