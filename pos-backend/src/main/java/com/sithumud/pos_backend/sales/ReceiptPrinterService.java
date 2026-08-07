package com.sithumud.pos_backend.sales;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.Base64;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.sithumud.pos_backend.sales.entity.Sale;
import com.sithumud.pos_backend.sales.entity.SaleItem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReceiptPrinterService {

    private final SaleRepository saleRepository;

    // ESC/POS Commands
    private static final byte[] INIT = {0x1B, 0x40};
    private static final byte[] ALIGN_CENTER = {0x1B, 0x61, 0x01};
    private static final byte[] ALIGN_LEFT = {0x1B, 0x61, 0x00};
    private static final byte[] ALIGN_RIGHT = {0x1B, 0x61, 0x02};
    private static final byte[] BOLD_ON = {0x1B, 0x45, 0x01};
    private static final byte[] BOLD_OFF = {0x1B, 0x45, 0x00};
    private static final byte[] CUT_PAPER = {0x1D, 0x56, 0x41, 0x10};
    private static final byte[] NEWLINE = {0x0A};

    public String generateReceipt(UUID saleId) {
        Sale sale = saleRepository.findById(saleId)
                .orElseThrow(() -> new IllegalArgumentException("Sale not found"));

        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            bos.write(INIT);
            
            // Header
            bos.write(ALIGN_CENTER);
            bos.write(BOLD_ON);
            bos.write(("Antigravity POS\n").getBytes());
            bos.write(BOLD_OFF);
            bos.write(("Branch: " + (sale.getBranch() != null ? sale.getBranch().getName() : "Main") + "\n").getBytes());
            bos.write(("Receipt: " + sale.getReceiptNumber() + "\n").getBytes());
            bos.write(("Date: " + sale.getSoldAt().toString() + "\n").getBytes());
            bos.write(NEWLINE);
            
            // Items
            bos.write(ALIGN_LEFT);
            bos.write("--------------------------------\n".getBytes());
            for (SaleItem item : sale.getItems()) {
                String itemName = item.getProductNameSnapshot();
                if (itemName.length() > 20) {
                    itemName = itemName.substring(0, 20);
                }
                String line = String.format("%-20s %3d x %5.2f\n", itemName, item.getQuantity(), item.getUnitPriceAtSale());
                bos.write(line.getBytes());
                String totalLine = String.format("%32.2f\n", item.getLineTotal());
                bos.write(totalLine.getBytes());
            }
            bos.write("--------------------------------\n".getBytes());
            
            // Totals
            bos.write(ALIGN_RIGHT);
            bos.write(BOLD_ON);
            bos.write(String.format("Subtotal: %8.2f\n", sale.getSubtotal()).getBytes());
            if (sale.getDiscount().compareTo(BigDecimal.ZERO) > 0) {
                bos.write(String.format("Discount: %8.2f\n", sale.getDiscount()).getBytes());
            }
            bos.write(String.format("TOTAL: %8.2f\n", sale.getTotal()).getBytes());
            bos.write(BOLD_OFF);
            bos.write(NEWLINE);
            
            // Footer
            bos.write(ALIGN_CENTER);
            bos.write("Thank you for your purchase!\n".getBytes());
            bos.write(NEWLINE);
            bos.write(NEWLINE);
            bos.write(NEWLINE);
            bos.write(CUT_PAPER);

            byte[] escposData = bos.toByteArray();
            return Base64.getEncoder().encodeToString(escposData);

        } catch (IOException e) {
            log.error("Error generating ESC/POS receipt", e);
            throw new RuntimeException("Failed to generate receipt", e);
        }
    }
}
