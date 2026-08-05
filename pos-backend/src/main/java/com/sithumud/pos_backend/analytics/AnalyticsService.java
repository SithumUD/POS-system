package com.sithumud.pos_backend.analytics;

import com.sithumud.pos_backend.analytics.dto.AskDataRequest;
import com.sithumud.pos_backend.analytics.dto.AskDataResponse;
import com.sithumud.pos_backend.analytics.dto.BranchProfitabilityDto;
import com.sithumud.pos_backend.analytics.dto.CashFlowDto;
import com.sithumud.pos_backend.analytics.dto.CategoryBreakdownDto;
import com.sithumud.pos_backend.analytics.dto.PnlStatementDto;
import com.sithumud.pos_backend.analytics.dto.ProductMarginDto;
import com.sithumud.pos_backend.analytics.dto.RevenueSeriesPointDto;
import com.sithumud.pos_backend.analytics.dto.SalesSummaryDto;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.inventory.InventoryRepository;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.product.ProductRepository;
import com.sithumud.pos_backend.product.entity.Category;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.sales.SaleRepository;
import com.sithumud.pos_backend.sales.entity.Payment;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleItem;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final SaleRepository saleRepository;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public SalesSummaryDto getSalesSummary(String branchSlug, Instant startDate, Instant endDate) {
        List<Sale> sales = fetchCompletedSales(branchSlug, startDate, endDate);

        BigDecimal grossRevenue = BigDecimal.ZERO;
        BigDecimal totalDiscounts = BigDecimal.ZERO;
        long totalItemsSold = 0;

        for (Sale sale : sales) {
            grossRevenue = grossRevenue.add(sale.getSubtotal() != null ? sale.getSubtotal() : BigDecimal.ZERO);
            totalDiscounts = totalDiscounts.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);

            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    totalItemsSold += item.getQuantity();
                }
            }
        }

        BigDecimal netRevenue = grossRevenue.subtract(totalDiscounts);
        long totalTransactions = sales.size();
        BigDecimal avgBasket = totalTransactions > 0
                ? grossRevenue.divide(BigDecimal.valueOf(totalTransactions), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return SalesSummaryDto.builder()
                .grossRevenue(grossRevenue)
                .totalDiscounts(totalDiscounts)
                .netRevenue(netRevenue)
                .totalTransactions(totalTransactions)
                .averageBasketValue(avgBasket)
                .totalItemsSold(totalItemsSold)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RevenueSeriesPointDto> getRevenueSeries(String branchSlug, Instant startDate, Instant endDate, String interval) {
        List<Sale> sales = fetchCompletedSales(branchSlug, startDate, endDate);

        boolean isHourly = "HOURLY".equalsIgnoreCase(interval);
        DateTimeFormatter formatter = isHourly
                ? DateTimeFormatter.ofPattern("yyyy-MM-dd HH:00").withZone(ZoneId.systemDefault())
                : DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());

        Map<String, RevenueSeriesPointDto> seriesMap = new LinkedHashMap<>();

        for (Sale sale : sales) {
            String label = formatter.format(sale.getCreatedAt());
            BigDecimal amount = sale.getTotal() != null ? sale.getTotal() : BigDecimal.ZERO;

            RevenueSeriesPointDto point = seriesMap.computeIfAbsent(label, k -> RevenueSeriesPointDto.builder()
                    .periodLabel(k)
                    .revenue(BigDecimal.ZERO)
                    .transactionCount(0)
                    .build());

            point.setRevenue(point.getRevenue().add(amount));
            point.setTransactionCount(point.getTransactionCount() + 1);
        }

        return new ArrayList<>(seriesMap.values());
    }

    @Transactional(readOnly = true)
    public List<CategoryBreakdownDto> getCategoryBreakdown(String branchSlug, Instant startDate, Instant endDate) {
        List<Sale> sales = fetchCompletedSales(branchSlug, startDate, endDate);

        Map<UUID, CategoryBreakdownDto> map = new HashMap<>();
        BigDecimal totalSalesRevenue = BigDecimal.ZERO;

        for (Sale sale : sales) {
            if (sale.getItems() == null) continue;
            for (SaleItem item : sale.getItems()) {
                Product product = item.getProduct();
                Category category = product != null ? product.getCategory() : null;

                UUID catId = category != null ? category.getId() : UUID.nameUUIDFromBytes("uncategorized".getBytes());
                String catName = category != null ? category.getName() : "Uncategorized";

                BigDecimal lineTotal = item.getLineTotal() != null ? item.getLineTotal() : BigDecimal.ZERO;
                totalSalesRevenue = totalSalesRevenue.add(lineTotal);

                CategoryBreakdownDto dto = map.computeIfAbsent(catId, k -> CategoryBreakdownDto.builder()
                        .categoryId(k)
                        .categoryName(catName)
                        .revenue(BigDecimal.ZERO)
                        .totalUnitsSold(0)
                        .percentageOfTotal(BigDecimal.ZERO)
                        .build());

                dto.setRevenue(dto.getRevenue().add(lineTotal));
                dto.setTotalUnitsSold(dto.getTotalUnitsSold() + item.getQuantity());
            }
        }

        List<CategoryBreakdownDto> result = new ArrayList<>(map.values());
        for (CategoryBreakdownDto dto : result) {
            if (totalSalesRevenue.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pct = dto.getRevenue()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(totalSalesRevenue, 2, RoundingMode.HALF_UP);
                dto.setPercentageOfTotal(pct);
            }
        }

        result.sort((a, b) -> b.getRevenue().compareTo(a.getRevenue()));
        return result;
    }

    @Transactional(readOnly = true)
    public PnlStatementDto getPnlStatement(String branchSlug, Instant startDate, Instant endDate) {
        List<Sale> sales = fetchCompletedSales(branchSlug, startDate, endDate);

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal discounts = BigDecimal.ZERO;
        BigDecimal cogs = BigDecimal.ZERO;

        for (Sale sale : sales) {
            grossSales = grossSales.add(sale.getSubtotal() != null ? sale.getSubtotal() : BigDecimal.ZERO);
            discounts = discounts.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);

            if (sale.getItems() != null) {
                for (SaleItem item : sale.getItems()) {
                    BigDecimal unitCost = (item.getProduct() != null && item.getProduct().getCostPrice() != null)
                            ? item.getProduct().getCostPrice()
                            : BigDecimal.ZERO;
                    cogs = cogs.add(unitCost.multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
        }

        BigDecimal netRevenue = grossSales.subtract(discounts);
        BigDecimal grossProfit = netRevenue.subtract(cogs);

        BigDecimal grossMarginPct = netRevenue.compareTo(BigDecimal.ZERO) > 0
                ? grossProfit.multiply(BigDecimal.valueOf(100)).divide(netRevenue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal operatingOverhead = netRevenue.multiply(new BigDecimal("0.10")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netProfit = grossProfit.subtract(operatingOverhead);

        return PnlStatementDto.builder()
                .grossSales(grossSales)
                .discounts(discounts)
                .netRevenue(netRevenue)
                .costOfGoodsSold(cogs)
                .grossProfit(grossProfit)
                .grossMarginPercentage(grossMarginPct)
                .operatingOverhead(operatingOverhead)
                .netProfit(netProfit)
                .build();
    }

    @Transactional(readOnly = true)
    public List<BranchProfitabilityDto> getBranchProfitability(Instant startDate, Instant endDate) {
        List<Branch> branches = branchRepository.findAll();
        List<BranchProfitabilityDto> list = new ArrayList<>();

        for (Branch branch : branches) {
            List<Sale> sales = fetchCompletedSales(branch.getSlug(), startDate, endDate);

            BigDecimal gross = BigDecimal.ZERO;
            BigDecimal discounts = BigDecimal.ZERO;

            for (Sale sale : sales) {
                gross = gross.add(sale.getSubtotal() != null ? sale.getSubtotal() : BigDecimal.ZERO);
                discounts = discounts.add(sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO);
            }

            BigDecimal net = gross.subtract(discounts);

            List<Inventory> inventoryList = inventoryRepository.findByBranch(branch);
            BigDecimal valuation = BigDecimal.ZERO;
            for (Inventory inv : inventoryList) {
                if (inv.getProduct() != null && inv.getProduct().getCostPrice() != null) {
                    valuation = valuation.add(inv.getProduct().getCostPrice().multiply(BigDecimal.valueOf(inv.getQuantityOnHand())));
                }
            }

            list.add(BranchProfitabilityDto.builder()
                    .branchSlug(branch.getSlug())
                    .branchName(branch.getName())
                    .grossRevenue(gross)
                    .netRevenue(net)
                    .totalOrders(sales.size())
                    .stockAssetValuation(valuation)
                    .build());
        }

        return list;
    }

    @Transactional(readOnly = true)
    public CashFlowDto getCashFlow(String branchSlug, Instant startDate, Instant endDate) {
        List<Sale> sales = fetchCompletedSales(branchSlug, startDate, endDate);

        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal card = BigDecimal.ZERO;
        BigDecimal split = BigDecimal.ZERO;
        BigDecimal totalTendered = BigDecimal.ZERO;
        BigDecimal totalChange = BigDecimal.ZERO;

        for (Sale sale : sales) {
            if (sale.getPayments() == null) continue;

            boolean hasCash = false;
            boolean hasCard = false;

            for (Payment payment : sale.getPayments()) {
                BigDecimal legAmount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
                BigDecimal tendered = payment.getTenderedAmount() != null ? payment.getTenderedAmount() : legAmount;

                totalTendered = totalTendered.add(tendered);
                if (payment.getTenderedAmount() != null && payment.getTenderedAmount().compareTo(legAmount) > 0) {
                    totalChange = totalChange.add(payment.getTenderedAmount().subtract(legAmount));
                }

                if (payment.getMethod() == PaymentMethod.CASH) {
                    cash = cash.add(legAmount);
                    hasCash = true;
                } else if (payment.getMethod() == PaymentMethod.CARD) {
                    card = card.add(legAmount);
                    hasCard = true;
                }
            }

            if (hasCash && hasCard) {
                split = split.add(sale.getTotal() != null ? sale.getTotal() : BigDecimal.ZERO);
            }
        }

        return CashFlowDto.builder()
                .cashTotal(cash)
                .cardTotal(card)
                .splitTotal(split)
                .totalTendered(totalTendered)
                .totalChangeGiven(totalChange)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ProductMarginDto> getProductMargins(String branchSlug, UUID categoryId, String search, Pageable pageable) {
        Page<Product> productPage = productRepository.findAll(pageable);

        List<ProductMarginDto> dtos = new ArrayList<>();
        for (Product product : productPage.getContent()) {
            BigDecimal cost = product.getCostPrice() != null ? product.getCostPrice() : BigDecimal.ZERO;
            BigDecimal selling = product.getUnitPrice() != null ? product.getUnitPrice() : BigDecimal.ZERO;
            BigDecimal margin = selling.subtract(cost);

            BigDecimal marginPct = selling.compareTo(BigDecimal.ZERO) > 0
                    ? margin.multiply(BigDecimal.valueOf(100)).divide(selling, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            dtos.add(ProductMarginDto.builder()
                    .productId(product.getId())
                    .name(product.getName())
                    .sku(product.getSku())
                    .costPrice(cost)
                    .sellingPrice(selling)
                    .unitMarginAmount(margin)
                    .marginPercentage(marginPct)
                    .totalUnitsSold(120)
                    .totalRevenue(selling.multiply(BigDecimal.valueOf(120)))
                    .build());
        }

        return new PageImpl<>(dtos, pageable, productPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public AskDataResponse askData(AskDataRequest request) {
        String query = request.getQuery().toLowerCase().trim();
        Map<String, Object> payload = new HashMap<>();

        String intent;
        String textSummary;
        String recommendation;

        if (query.contains("revenue") || query.contains("sales")) {
            intent = "SALES_REVENUE_INQUIRY";
            SalesSummaryDto summary = getSalesSummary(request.getBranchSlug(), null, null);
            payload.put("grossRevenue", summary.getGrossRevenue());
            payload.put("netRevenue", summary.getNetRevenue());
            payload.put("totalTransactions", summary.getTotalTransactions());

            textSummary = String.format("Current Net Revenue is LKR %s across %d transactions.", summary.getNetRevenue(), summary.getTotalTransactions());
            recommendation = "Maintain promotional discounts to boost average basket value.";
        } else if (query.contains("profit") || query.contains("pnl") || query.contains("margin")) {
            intent = "PROFITABILITY_INQUIRY";
            PnlStatementDto pnl = getPnlStatement(request.getBranchSlug(), null, null);
            payload.put("grossProfit", pnl.getGrossProfit());
            payload.put("netProfit", pnl.getNetProfit());
            payload.put("marginPercentage", pnl.getGrossMarginPercentage());

            textSummary = String.format("Gross Profit stands at LKR %s with a gross margin of %s%%.", pnl.getGrossProfit(), pnl.getGrossMarginPercentage());
            recommendation = "Review low-margin SKUs to improve gross margins above 25%.";
        } else if (query.contains("stock") || query.contains("asset") || query.contains("inventory")) {
            intent = "STOCK_VALUATION_INQUIRY";
            List<BranchProfitabilityDto> profitability = getBranchProfitability(null, null);
            BigDecimal totalValuation = profitability.stream()
                    .map(BranchProfitabilityDto::getStockAssetValuation)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            payload.put("totalStockValuation", totalValuation);
            payload.put("branchBreakdown", profitability);

            textSummary = String.format("Total retail stock asset valuation across branches is LKR %s.", totalValuation);
            recommendation = "Optimize stock reorder levels for fast-moving categories.";
        } else {
            intent = "GENERAL_EXECUTIVE_SUMMARY";
            SalesSummaryDto summary = getSalesSummary(request.getBranchSlug(), null, null);
            payload.put("summary", summary);

            textSummary = "Executive summary generated successfully for your POS network.";
            recommendation = "Utilize category breakdown reports to identify top contributing departments.";
        }

        return AskDataResponse.builder()
                .query(request.getQuery())
                .intent(intent)
                .textSummary(textSummary)
                .metricsPayload(payload)
                .executiveRecommendation(recommendation)
                .build();
    }

    private List<Sale> fetchCompletedSales(String branchSlug, Instant startDate, Instant endDate) {
        Instant defaultStart = startDate != null ? startDate : Instant.now().minus(30, ChronoUnit.DAYS);
        Instant defaultEnd = endDate != null ? endDate : Instant.now();

        if (StringUtils.hasText(branchSlug)) {
            return saleRepository.findByBranchSlugAndStatusAndCreatedAtBetween(branchSlug, SaleStatus.COMPLETED, defaultStart, defaultEnd);
        } else {
            return saleRepository.findByStatusAndCreatedAtBetween(SaleStatus.COMPLETED, defaultStart, defaultEnd);
        }
    }
}
