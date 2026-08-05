package com.sithumud.pos_backend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AskDataResponse {

    private String query;
    private String intent;
    private String textSummary;
    private Map<String, Object> metricsPayload;
    private String executiveRecommendation;
}
