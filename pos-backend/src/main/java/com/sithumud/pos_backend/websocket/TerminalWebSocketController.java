package com.sithumud.pos_backend.websocket;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequiredArgsConstructor
@Slf4j
public class TerminalWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/terminal/{terminalId}/scan")
    public void handleBarcodeScan(@DestinationVariable String terminalId, ScanPayload payload) {
        log.info("Received scan on terminal {}: {}", terminalId, payload.getBarcode());
        
        // Broadcast to the specific terminal's topic
        messagingTemplate.convertAndSend("/topic/terminal/" + terminalId + "/scans", payload);
    }

    @MessageMapping("/terminal/{terminalId}/print")
    public void handlePrintReceipt(@DestinationVariable String terminalId, PrintPayload payload) {
        log.info("Received print command for terminal {}", terminalId);
        
        // Broadcast to the specific terminal's print topic
        messagingTemplate.convertAndSend("/topic/terminal/" + terminalId + "/prints", payload);
    }
}
