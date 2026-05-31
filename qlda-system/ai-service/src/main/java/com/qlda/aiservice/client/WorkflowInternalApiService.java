package com.qlda.aiservice.client;

public interface WorkflowInternalApiService {
    long getMyDueSoonDocumentCount(Long userId, int days);

    long getMyOverdueDocumentCount(Long userId);

    long getMyPendingDocumentCount(Long userId);

    long getMyCompletedDocumentCount(Long userId);

    long getSlaViolationCount();
}
