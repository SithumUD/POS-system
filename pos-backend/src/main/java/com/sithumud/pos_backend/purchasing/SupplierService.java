package com.sithumud.pos_backend.purchasing;

import com.sithumud.pos_backend.common.exception.ApiException;
import com.sithumud.pos_backend.purchasing.dto.CreateSupplierRequest;
import com.sithumud.pos_backend.purchasing.dto.SupplierDto;
import com.sithumud.pos_backend.purchasing.dto.SupplierSearchFilter;
import com.sithumud.pos_backend.purchasing.dto.UpdateSupplierRequest;
import com.sithumud.pos_backend.purchasing.entity.Supplier;
import com.sithumud.pos_backend.purchasing.entity.SupplierStatus;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional(readOnly = true)
    public Page<SupplierDto> getSuppliers(SupplierSearchFilter filter, Pageable pageable) {
        Specification<Supplier> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate contactLike = cb.like(cb.lower(root.get("contactPerson")), pattern);
                Predicate phoneLike = cb.like(cb.lower(root.get("phone")), pattern);
                Predicate emailLike = cb.like(cb.lower(root.get("contactEmail")), pattern);
                predicates.add(cb.or(nameLike, contactLike, phoneLike, emailLike));
            }

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (StringUtils.hasText(filter.getCategorySlug())) {
                predicates.add(cb.isMember(filter.getCategorySlug().toLowerCase().trim(), root.get("suppliedCategories")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Supplier> page = supplierRepository.findAll(spec, pageable);
        List<SupplierDto> dtos = page.getContent().stream().map(SupplierDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public SupplierDto getSupplierById(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found with ID: " + id));

        return SupplierDto.fromEntity(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(CreateSupplierRequest request) {
        if (supplierRepository.existsByName(request.getName().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "SUPPLIER_EXISTS", "Supplier already exists with name: " + request.getName());
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .contactPerson(request.getContactPerson())
                .phone(request.getPhone())
                .contactEmail(request.getContactEmail())
                .address(request.getAddress())
                .paymentTerms(request.getPaymentTerms())
                .leadTimeDays(request.getLeadTimeDays() != null ? request.getLeadTimeDays() : 3)
                .status(SupplierStatus.ACTIVE)
                .notes(request.getNotes())
                .suppliedCategories(request.getSuppliedCategories() != null ? request.getSuppliedCategories() : new ArrayList<>())
                .build();

        Supplier saved = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(saved);
    }

    @Transactional
    public SupplierDto updateSupplier(UUID id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found with ID: " + id));

        supplier.setName(request.getName().trim());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setContactEmail(request.getContactEmail());
        supplier.setAddress(request.getAddress());
        supplier.setPaymentTerms(request.getPaymentTerms());
        if (request.getLeadTimeDays() != null) {
            supplier.setLeadTimeDays(request.getLeadTimeDays());
        }
        if (request.getStatus() != null) {
            supplier.setStatus(request.getStatus());
        }
        supplier.setNotes(request.getNotes());
        if (request.getSuppliedCategories() != null) {
            supplier.setSuppliedCategories(request.getSuppliedCategories());
        }

        Supplier saved = supplierRepository.save(supplier);
        return SupplierDto.fromEntity(saved);
    }

    @Transactional
    public void deleteSupplier(UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SUPPLIER_NOT_FOUND", "Supplier not found with ID: " + id));

        supplierRepository.delete(supplier);
    }
}
