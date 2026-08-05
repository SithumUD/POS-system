package com.sithumud.pos_backend.alert;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sithumud.pos_backend.alert.dto.AddNoteRequest;
import com.sithumud.pos_backend.alert.dto.AnomalyAlertDto;
import com.sithumud.pos_backend.alert.dto.ScanSummaryDto;
import com.sithumud.pos_backend.alert.entity.AlertSeverity;
import com.sithumud.pos_backend.alert.entity.AlertStatus;
import com.sithumud.pos_backend.alert.entity.AlertType;
import com.sithumud.pos_backend.common.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AlertControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private AlertService alertService;

    @InjectMocks
    private AlertController alertController;

    private AnomalyAlertDto mockAlertDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        mockMvc = MockMvcBuilders.standaloneSetup(alertController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setConversionService(new org.springframework.format.support.DefaultFormattingConversionService())
                .build();

        mockAlertDto = AnomalyAlertDto.builder()
                .id(UUID.randomUUID())
                .type(AlertType.ELEVATED_VOIDS)
                .severity(AlertSeverity.HIGH)
                .status(AlertStatus.NEW)
                .title("Elevated Voided Sales Activity")
                .description("Detected 3 voided transactions in 24 hours")
                .branchSlug("colombo")
                .branchName("Colombo Store")
                .detectedAt(Instant.now())
                .investigationNotes(List.of())
                .build();
    }

    @Test
    void testGetAlertsSuccess() throws Exception {
        given(alertService.getAlerts(any(), any(Pageable.class)))
                .willReturn(new PageImpl<>(List.of(mockAlertDto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/alerts")
                        .param("branchSlug", "colombo")
                        .param("page", "0")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].type").value("ELEVATED_VOIDS"));
    }

    @Test
    void testGetAlertByIdSuccess() throws Exception {
        UUID id = mockAlertDto.getId();
        given(alertService.getAlertById(id)).willReturn(mockAlertDto);

        mockMvc.perform(get("/api/v1/alerts/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()));
    }

    @Test
    void testRunHeuristicScanSuccess() throws Exception {
        ScanSummaryDto summary = ScanSummaryDto.builder()
                .scannedAt(Instant.now())
                .newAlertsGenerated(1)
                .alerts(List.of(mockAlertDto))
                .build();

        given(alertService.runHeuristicScan()).willReturn(summary);

        mockMvc.perform(post("/api/v1/alerts/scan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.newAlertsGenerated").value(1));
    }

    @Test
    void testUpdateStatusSuccess() throws Exception {
        UUID id = mockAlertDto.getId();
        mockAlertDto.setStatus(AlertStatus.INVESTIGATING);
        given(alertService.updateStatus(eq(id), eq(AlertStatus.INVESTIGATING))).willReturn(mockAlertDto);

        mockMvc.perform(patch("/api/v1/alerts/{id}/status?status=INVESTIGATING", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INVESTIGATING"));
    }

    @Test
    void testAddNoteSuccess() throws Exception {
        UUID id = mockAlertDto.getId();
        mockAlertDto.setInvestigationNotes(List.of("Reviewed register 1 receipt history"));
        given(alertService.addNote(eq(id), any(String.class))).willReturn(mockAlertDto);

        AddNoteRequest request = AddNoteRequest.builder()
                .note("Reviewed register 1 receipt history")
                .build();

        mockMvc.perform(post("/api/v1/alerts/{id}/notes", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.investigationNotes[0]").value("Reviewed register 1 receipt history"));
    }
}
