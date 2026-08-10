package com.sithumud.pos_backend.config;

import com.sithumud.pos_backend.auth.UserRepository;
import com.sithumud.pos_backend.auth.entity.Role;
import com.sithumud.pos_backend.auth.entity.User;
import com.sithumud.pos_backend.auth.entity.UserStatus;
import com.sithumud.pos_backend.branch.BranchRepository;
import com.sithumud.pos_backend.branch.entity.Branch;
import com.sithumud.pos_backend.branch.entity.BranchStatus;
import com.sithumud.pos_backend.inventory.InventoryRepository;
import com.sithumud.pos_backend.inventory.entity.Inventory;
import com.sithumud.pos_backend.product.CategoryRepository;
import com.sithumud.pos_backend.product.ProductRepository;
import com.sithumud.pos_backend.product.entity.Category;
import com.sithumud.pos_backend.product.entity.Product;
import com.sithumud.pos_backend.product.entity.UnitOfMeasure;
import com.sithumud.pos_backend.sales.SaleRepository;
import com.sithumud.pos_backend.sales.entity.Payment;
import com.sithumud.pos_backend.sales.entity.PaymentMethod;
import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleItem;
import com.sithumud.pos_backend.sales.entity.SaleStatus;
import com.sithumud.pos_backend.tenant.TenantRepository;
import com.sithumud.pos_backend.tenant.context.TenantContext;
import com.sithumud.pos_backend.tenant.entity.PlanType;
import com.sithumud.pos_backend.tenant.entity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final SaleRepository saleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String DEMO_EMAIL    = "demo@business.com";
    private static final String DEMO_PASSWORD = "demo123";

    @Value("${app.super-admin.email:sithumudayangaofficial@gmail.com}")
    private String superAdminEmail;

    @Value("${app.super-admin.password:Olusha123}")
    private String superAdminPassword;

    @Override
    public void run(String... args) {

        // ── Seed SUPER_ADMIN ───────────────────────────────────────────────
        TenantContext.clear(); // Ensure super admin has no tenant
        if (!userRepository.existsByEmail(superAdminEmail)) {
            userRepository.save(User.builder()
                    .name("NexPOS Team")
                    .email(superAdminEmail)
                    .passwordHash(passwordEncoder.encode(superAdminPassword))
                    .role(Role.SUPER_ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build());
            log.info("Super admin seeded (email={}).", superAdminEmail);
        } else {
            // Update password just in case
            userRepository.findByEmail(superAdminEmail).ifPresent(u -> {
                u.setPasswordHash(passwordEncoder.encode(superAdminPassword));
                userRepository.save(u);
            });
        }

        // ── Step 1: Resolve / create the demo Tenant ──────────────────────────
        // First try to locate tenant via the demo user (most accurate),
        // then fall back to the tenant's contact email.
        Tenant demoTenant;
        Optional<UUID> existingTenantIdFromUser = userRepository.findTenantIdByEmail(DEMO_EMAIL);

        if (existingTenantIdFromUser.isPresent()) {
            demoTenant = tenantRepository.findById(existingTenantIdFromUser.get())
                    .orElseGet(this::createDemoTenant);
        } else {
            demoTenant = tenantRepository.findFirstByContactEmail(DEMO_EMAIL)
                    .orElseGet(this::createDemoTenant);
        }

        // ── Step 2: Set tenant context for ALL repository operations below ─────
        TenantContext.setTenantId(demoTenant.getId());
        try {
            // ── Step 3: Always reset the demo user password so login always works
            User demoUser = userRepository.findByEmail(DEMO_EMAIL).map(u -> {
                u.setPasswordHash(passwordEncoder.encode(DEMO_PASSWORD));
                u.setStatus(UserStatus.ACTIVE);
                u.setRole(Role.MANAGER); // MANAGER sees all read endpoints; VIEWER is too restrictive for demo
                return userRepository.save(u);
            }).orElseGet(() -> userRepository.save(User.builder()
                    .name("Demo User")
                    .email(DEMO_EMAIL)
                    .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                    .role(Role.MANAGER)
                    .status(UserStatus.ACTIVE)
                    .build()));
            log.info("Demo user ready (email={}, role=MANAGER).", DEMO_EMAIL);

            // ── Step 4: Seed Branches ─────────────────────────────────────────
            Branch mainBranch = upsertBranch("demo-main", "New York Main Store",   "NY Main",
                    "123 Broadway, New York, NY 10001",   "+1 212 555 0199", "08:00", "22:00", 3);
            Branch sfBranch   = upsertBranch("demo-sf",   "San Francisco Hub",     "SF Hub",
                    "456 Market St, San Francisco, CA 94104", "+1 415 555 0288", "09:00", "21:00", 2);
            Branch chicBranch = upsertBranch("demo-chi",  "Chicago Downtown",      "Chi DT",
                    "789 Michigan Ave, Chicago, IL 60611",  "+1 312 555 0377", "08:30", "21:30", 2);
            log.info("Demo branches ready.");

            // ── Step 5: Seed admin cashier (needed for sales records) ──────────
            User demoAdmin = userRepository.findByEmail("admin@demo.com").map(u -> {
                u.setStatus(UserStatus.ACTIVE);
                return userRepository.save(u);
            }).orElseGet(() -> userRepository.save(User.builder()
                    .name("System Admin")
                    .email("admin@demo.com")
                    .passwordHash(passwordEncoder.encode(DEMO_PASSWORD))
                    .role(Role.ADMIN)
                    .branch(mainBranch)
                    .status(UserStatus.ACTIVE)
                    .build()));

            // ── Step 6: Seed Categories ───────────────────────────────────────
            Category electronics  = upsertCategory("Electronics",    "electronics",   1, null);
            Category clothing     = upsertCategory("Clothing",       "clothing",      2, null);
            Category groceries    = upsertCategory("Groceries",      "groceries",     3, null);
            Category homeOffice   = upsertCategory("Home & Office",  "home-office",   4, null);
            Category beauty       = upsertCategory("Beauty & Health","beauty-health", 5, null);
            log.info("Demo categories ready.");

            // ── Step 7: Seed Products (idempotent via SKU) ────────────────────
            List<Product> products = new ArrayList<>();
            // Electronics
            products.add(upsertProduct("ELEC-001", "Wireless Mouse",                    "10000001", electronics, "25.00",  "15.00"));
            products.add(upsertProduct("ELEC-002", "Mechanical Keyboard",               "10000002", electronics, "120.00", "80.00"));
            products.add(upsertProduct("ELEC-003", "Noise Cancelling Headphones",       "10000003", electronics, "250.00", "150.00"));
            products.add(upsertProduct("ELEC-004", "USB-C Hub 7-in-1",                  "10000004", electronics, "55.00",  "30.00"));
            products.add(upsertProduct("ELEC-005", "Portable Phone Charger 20000mAh",   "10000005", electronics, "45.00",  "25.00"));
            products.add(upsertProduct("ELEC-006", "Smart Speaker",                     "10000006", electronics, "99.00",  "60.00"));
            products.add(upsertProduct("ELEC-007", "Webcam 1080p",                      "10000007", electronics, "80.00",  "45.00"));
            // Clothing
            products.add(upsertProduct("CLOT-001", "Cotton T-Shirt (M)",                "20000001", clothing,    "18.00",  "8.00"));
            products.add(upsertProduct("CLOT-002", "Denim Jeans (32)",                  "20000002", clothing,    "45.00",  "20.00"));
            products.add(upsertProduct("CLOT-003", "Running Shoes (10)",                "20000003", clothing,    "85.00",  "40.00"));
            products.add(upsertProduct("CLOT-004", "Hooded Sweatshirt (L)",             "20000004", clothing,    "55.00",  "25.00"));
            products.add(upsertProduct("CLOT-005", "Sports Socks (5-pack)",             "20000005", clothing,    "12.00",  "5.00"));
            // Groceries
            products.add(upsertProduct("GROC-001", "Organic Coffee Beans 1lb",          "30000001", groceries,   "14.00",  "9.00"));
            products.add(upsertProduct("GROC-002", "Almond Milk 1L",                    "30000002", groceries,   "4.50",   "2.50"));
            products.add(upsertProduct("GROC-003", "Whole Wheat Bread",                 "30000003", groceries,   "3.50",   "1.50"));
            products.add(upsertProduct("GROC-004", "Avocado (each)",                    "30000004", groceries,   "2.00",   "0.80"));
            products.add(upsertProduct("GROC-005", "Greek Yogurt 500g",                 "30000005", groceries,   "5.00",   "2.80"));
            products.add(upsertProduct("GROC-006", "Fresh Orange Juice 1L",             "30000006", groceries,   "6.00",   "3.50"));
            // Home & Office
            products.add(upsertProduct("HOME-001", "Desk Lamp LED",                     "40000001", homeOffice,  "35.00",  "18.00"));
            products.add(upsertProduct("HOME-002", "Notebook A5 (pack of 3)",           "40000002", homeOffice,  "9.00",   "4.00"));
            products.add(upsertProduct("HOME-003", "Coffee Mug 350ml",                  "40000003", homeOffice,  "12.00",  "5.00"));
            // Beauty & Health
            products.add(upsertProduct("BEAU-001", "SPF 50 Sunscreen 100ml",            "50000001", beauty,      "15.00",  "7.00"));
            products.add(upsertProduct("BEAU-002", "Vitamin C Supplement 60 caps",      "50000002", beauty,      "22.00",  "11.00"));
            log.info("Demo products ready ({} products).", products.size());

            // ── Step 8: Seed Inventory for each branch (idempotent) ───────────
            for (Product p : products) {
                upsertInventory(p, mainBranch, 80 + (int)(Math.random() * 120));
                upsertInventory(p, sfBranch,   40 + (int)(Math.random() * 80));
                upsertInventory(p, chicBranch, 30 + (int)(Math.random() * 70));
            }
            log.info("Demo inventory ready.");

            // ── Step 9: Seed Sales (only if none exist yet) ───────────────────
            long existingSales = saleRepository.count();
            if (existingSales == 0) {
                seedHistoricalSales(products, mainBranch, sfBranch, demoAdmin);
                log.info("Demo sales data seeded.");
            } else {
                log.info("Sales data already exists ({} records). Skipping.", existingSales);
            }

            log.info("✅ Demo data seeding complete for tenant [{}].", demoTenant.getId());

        } finally {
            TenantContext.clear();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Tenant createDemoTenant() {
        log.info("Creating new Demo tenant...");
        return tenantRepository.save(Tenant.builder()
                .name("Live Demo Business")
                .contactEmail(DEMO_EMAIL)
                .plan(PlanType.PROFESSIONAL)
                .maxBranches(10)
                .maxUsers(50)
                .maxProducts(50000)
                .build());
    }

    private Branch upsertBranch(String slug, String name, String shortName,
                                 String address, String phone,
                                 String opensAt, String closesAt, int terminals) {
        return branchRepository.findBySlug(slug).orElseGet(() ->
            branchRepository.save(Branch.builder()
                .slug(slug).name(name).shortName(shortName)
                .address(address).phone(phone)
                .opensAt(opensAt).closesAt(closesAt)
                .terminalCount(terminals)
                .status(BranchStatus.OPEN)
                .build())
        );
    }

    private Category upsertCategory(String name, String slug, int order, Category parent) {
        return categoryRepository.findBySlug(slug).orElseGet(() ->
            categoryRepository.save(Category.builder()
                .name(name).slug(slug).displayOrder(order).parent(parent).build())
        );
    }

    private Product upsertProduct(String sku, String name, String barcode,
                                   Category category, String unitPrice, String costPrice) {
        return productRepository.findBySku(sku).orElseGet(() ->
            productRepository.save(Product.builder()
                .sku(sku).name(name).barcode(barcode).category(category)
                .unitPrice(new BigDecimal(unitPrice))
                .costPrice(new BigDecimal(costPrice))
                .taxRate(new BigDecimal("8.00"))
                .reorderThreshold(15)
                .unitOfMeasure(UnitOfMeasure.EACH)
                .unitLabel("Item")
                .active(true)
                .build())
        );
    }

    private void upsertInventory(Product product, Branch branch, int qty) {
        inventoryRepository.findByProductAndBranch(product, branch).orElseGet(() ->
            inventoryRepository.save(Inventory.builder()
                .product(product).branch(branch).quantityOnHand(qty).build())
        );
    }

    private void seedHistoricalSales(List<Product> products, Branch mainBranch,
                                      Branch sfBranch, User cashier) {
        Random rand   = new Random(42); // fixed seed for reproducibility
        Instant now   = Instant.now();
        int saleCount = 1;

        for (int daysAgo = 30; daysAgo >= 0; daysAgo--) {
            // More sales on weekdays, fewer on weekends (simulate real pattern)
            int salesPerDay = 5 + rand.nextInt(8); // 5 to 12 per day
            Branch branch   = (daysAgo % 3 == 0) ? sfBranch : mainBranch;

            for (int i = 0; i < salesPerDay; i++) {
                Instant soldAt = now.minus(daysAgo, ChronoUnit.DAYS)
                        .minus(rand.nextInt(12), ChronoUnit.HOURS)
                        .minus(rand.nextInt(60), ChronoUnit.MINUTES);

                String receiptPrefix = (branch == mainBranch) ? "NY" : "SF";
                Sale sale = Sale.builder()
                        .receiptNumber("DEMO-" + receiptPrefix + "-" + String.format("%04d", saleCount++))
                        .branch(branch)
                        .cashier(cashier)
                        .terminalId("TERM-" + (1 + rand.nextInt(3)))
                        .status(SaleStatus.COMPLETED)
                        .soldAt(soldAt)
                        .subtotal(BigDecimal.ZERO)
                        .discount(BigDecimal.ZERO)
                        .tax(BigDecimal.ZERO)
                        .total(BigDecimal.ZERO)
                        .idempotencyKey(UUID.randomUUID().toString())
                        .build();

                int numItems  = 1 + rand.nextInt(5);
                BigDecimal subtotal = BigDecimal.ZERO;

                for (int j = 0; j < numItems; j++) {
                    Product p   = products.get(rand.nextInt(products.size()));
                    int qty     = 1 + rand.nextInt(3);
                    BigDecimal price     = p.getUnitPrice();
                    BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(qty));
                    subtotal = subtotal.add(lineTotal);

                    SaleItem item = SaleItem.builder()
                            .product(p)
                            .productNameSnapshot(p.getName())
                            .productSkuSnapshot(p.getSku())
                            .quantity(qty)
                            .unitPriceAtSale(price)
                            .discount(BigDecimal.ZERO)
                            .lineTotal(lineTotal)
                            .build();
                    sale.addItem(item);
                }

                BigDecimal tax = subtotal.multiply(new BigDecimal("0.08"));
                sale.setSubtotal(subtotal);
                sale.setTax(tax);
                sale.setTotal(subtotal.add(tax));

                // Vary payment methods realistically
                PaymentMethod method;
                int r = rand.nextInt(10);
                if      (r < 5) method = PaymentMethod.CARD;
                else if (r < 8) method = PaymentMethod.CASH;
                else            method = PaymentMethod.CARD; // could add more types if available

                sale.addPayment(Payment.builder()
                        .method(method)
                        .amount(sale.getTotal())
                        .build());

                saleRepository.save(sale);
            }
        }
    }
}
