package com.qlda.aiservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record ChatbotFeedbackRequest(
    @NotNull Long resultId,
    @NotNull @Pattern(regexp = "UP|DOWN") String feedback,
    String comment
) {
}
