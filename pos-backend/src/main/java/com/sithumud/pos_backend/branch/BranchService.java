package com.sithumud.pos_backend.branch;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.branch.dto.BranchDto;
import com.sithumud.pos_backend.branch.dto.BranchSearchFilter;
import com.sithumud.pos_backend.branch.dto.CreateBranchRequest;
import com.sithumud.pos_backend.branch.dto.UpdateBranchRequest;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.branch.entity.BranchStatus;
import com.sithumud.pos_backend.common.exception.ApiException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<BranchDto> getBranches(BranchSearchFilter filter, Pageable pageable) {
        Specification<Branch> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
            }

            if (StringUtils.hasText(filter.getSearch())) {
                String pattern = "%" + filter.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate slugLike = cb.like(cb.lower(root.get("slug")), pattern);
                Predicate addressLike = cb.like(cb.lower(root.get("address")), pattern);
                predicates.add(cb.or(nameLike, slugLike, addressLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Branch> page = branchRepository.findAll(spec, pageable);
        List<BranchDto> dtos = page.getContent().stream().map(BranchDto::fromEntity).collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public BranchDto getBranchByIdOrSlug(String idOrSlug) {
        Branch branch;
        try {
            UUID id = UUID.fromString(idOrSlug);
            branch = branchRepository.findById(id)
                    .orElseGet(() -> branchRepository.findBySlug(idOrSlug)
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Store branch not found: " + idOrSlug)));
        } catch (IllegalArgumentException e) {
            branch = branchRepository.findBySlug(idOrSlug)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Store branch not found: " + idOrSlug));
        }

        return BranchDto.fromEntity(branch);
    }

    @Transactional
    public BranchDto createBranch(CreateBranchRequest request) {
        String slug = generateSlug(request.getName());
        if (branchRepository.existsBySlug(slug)) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 4);
        }

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "MANAGER_NOT_FOUND", "Manager user not found: " + request.getManagerId()));
        }

        Branch branch = Branch.builder()
                .name(request.getName().trim())
                .slug(slug)
                .shortName(StringUtils.hasText(request.getShortName()) ? request.getShortName().trim() : request.getName().trim())
                .address(request.getAddress())
                .phone(request.getPhone())
                .manager(manager)
                .opensAt(StringUtils.hasText(request.getOpensAt()) ? request.getOpensAt() : "08:00")
                .closesAt(StringUtils.hasText(request.getClosesAt()) ? request.getClosesAt() : "22:00")
                .terminalCount(request.getTerminalCount() != null ? request.getTerminalCount() : 1)
                .status(request.getStatus() != null ? request.getStatus() : BranchStatus.OPEN)
                .build();

        Branch saved = branchRepository.save(branch);
        return BranchDto.fromEntity(saved);
    }

    @Transactional
    public BranchDto updateBranch(UUID id, UpdateBranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Store branch not found: " + id));

        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "MANAGER_NOT_FOUND", "Manager user not found: " + request.getManagerId()));
        }

        branch.setName(request.getName().trim());
        if (StringUtils.hasText(request.getShortName())) {
            branch.setShortName(request.getShortName().trim());
        }
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setManager(manager);
        if (StringUtils.hasText(request.getOpensAt())) {
            branch.setOpensAt(request.getOpensAt());
        }
        if (StringUtils.hasText(request.getClosesAt())) {
            branch.setClosesAt(request.getClosesAt());
        }
        if (request.getTerminalCount() != null) {
            branch.setTerminalCount(request.getTerminalCount());
        }
        if (request.getStatus() != null) {
            branch.setStatus(request.getStatus());
        }

        Branch saved = branchRepository.save(branch);
        return BranchDto.fromEntity(saved);
    }

    @Transactional
    public void deleteBranch(UUID id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BRANCH_NOT_FOUND", "Store branch not found: " + id));

        branch.setStatus(BranchStatus.CLOSED);
        branchRepository.save(branch);
    }

    private String generateSlug(String input) {
        if (!StringUtils.hasText(input)) return "branch";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
