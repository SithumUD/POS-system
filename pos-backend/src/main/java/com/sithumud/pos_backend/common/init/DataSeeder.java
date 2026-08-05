package com.sithumud.pos_backend.common.init;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Branch mainBranch = branchRepository.findBySlug("colombo").orElseGet(() -> {
            Branch branch = Branch.builder()
                    .slug("colombo")
                    .name("Colombo – Main Branch")
                    .shortName("Colombo – Main")
                    .address("148 Galle Road, Kollupitiya, Colombo 03")
                    .phone("+94 11 234 8800")
                    .opensAt("07:30")
                    .closesAt("22:00")
                    .terminalCount(4)
                    .status(BranchStatus.OPEN)
                    .build();
            log.info("Seeding default main branch 'colombo'...");
            return branchRepository.save(branch);
        });

        if (!userRepository.existsByEmail("admin@retailos.lk")) {
            User admin = User.builder()
                    .name("Ruwan Silva (Admin)")
                    .email("admin@retailos.lk")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .branch(mainBranch)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            log.info("Seeding default admin user 'admin@retailos.lk'");
        }

        if (!userRepository.existsByEmail("manager@retailos.lk")) {
            User manager = User.builder()
                    .name("Anushka Weerasinghe (Manager)")
                    .email("manager@retailos.lk")
                    .passwordHash(passwordEncoder.encode("manager123"))
                    .role(Role.MANAGER)
                    .branch(mainBranch)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(manager);
            log.info("Seeding default manager user 'manager@retailos.lk'");
        }

        if (!userRepository.existsByEmail("cashier@retailos.lk")) {
            User cashier = User.builder()
                    .name("Dilhani Perera (Cashier)")
                    .email("cashier@retailos.lk")
                    .passwordHash(passwordEncoder.encode("cashier123"))
                    .role(Role.CASHIER)
                    .branch(mainBranch)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(cashier);
            log.info("Seeding default cashier user 'cashier@retailos.lk'");
        }

        // Seed Categories
        Category beverages = categoryRepository.findBySlug("beverages").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Beverages").slug("beverages").displayOrder(1).build())
        );

        Category softDrinks = categoryRepository.findBySlug("soft-drinks").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Soft Drinks").slug("soft-drinks").parent(beverages).displayOrder(1).build())
        );

        Category snacks = categoryRepository.findBySlug("snacks").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Snacks").slug("snacks").displayOrder(2).build())
        );

        Category dairy = categoryRepository.findBySlug("dairy").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Dairy").slug("dairy").displayOrder(3).build())
        );

        // Seed Products
        if (!productRepository.existsBySku("BEV-CC-400")) {
            Product coke = productRepository.save(Product.builder()
                    .sku("BEV-CC-400")
                    .barcode("4792024011234")
                    .name("Coca-Cola 400ml")
                    .category(softDrinks)
                    .unitPrice(new BigDecimal("180.00"))
                    .costPrice(new BigDecimal("132.00"))
                    .taxRate(new BigDecimal("10.00"))
                    .reorderThreshold(12)
                    .unitOfMeasure(UnitOfMeasure.EACH)
                    .unitLabel("Bottle")
                    .active(true)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .product(coke)
                    .branch(mainBranch)
                    .quantityOnHand(42)
                    .build());
            log.info("Seeding sample product 'BEV-CC-400' with initial stock 42");
        }

        if (!productRepository.existsBySku("SNK-MC-190")) {
            Product cracker = productRepository.save(Product.builder()
                    .sku("SNK-MC-190")
                    .barcode("4792024022345")
                    .name("Munchee Super Cream Cracker 190g")
                    .category(snacks)
                    .unitPrice(new BigDecimal("220.00"))
                    .costPrice(new BigDecimal("165.00"))
                    .taxRate(new BigDecimal("0.00"))
                    .reorderThreshold(15)
                    .unitOfMeasure(UnitOfMeasure.EACH)
                    .unitLabel("Pack")
                    .active(true)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .product(cracker)
                    .branch(mainBranch)
                    .quantityOnHand(60)
                    .build());
            log.info("Seeding sample product 'SNK-MC-190' with initial stock 60");
        }

        if (!productRepository.existsBySku("DRY-ANC-400")) {
            Product milk = productRepository.save(Product.builder()
                    .sku("DRY-ANC-400")
                    .barcode("4792024033456")
                    .name("Anchor Full Cream Milk Powder 400g")
                    .category(dairy)
                    .unitPrice(new BigDecimal("1150.00"))
                    .costPrice(new BigDecimal("980.00"))
                    .taxRate(new BigDecimal("0.00"))
                    .reorderThreshold(20)
                    .unitOfMeasure(UnitOfMeasure.EACH)
                    .unitLabel("Pack")
                    .active(true)
                    .build());

            inventoryRepository.save(Inventory.builder()
                    .product(milk)
                    .branch(mainBranch)
                    .quantityOnHand(8) // low stock relative to threshold 20
                    .build());
            log.info("Seeding sample product 'DRY-ANC-400' with low stock 8");
        }
    }
}
