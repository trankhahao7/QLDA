package com.qlda.notificationservice.scheduler;

import com.qlda.notificationservice.audit.entity.LichSuHeThong;
import com.qlda.notificationservice.audit.repository.LichSuHeThongRepository;
import com.qlda.notificationservice.client.WorkflowServiceClient;
import com.qlda.notificationservice.client.dto.SlaViolationClientItem;
import com.qlda.notificationservice.notification.dto.NotificationCreateRequest;
import com.qlda.notificationservice.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlaSchedulerTest {

    @Mock
    private WorkflowServiceClient workflowServiceClient;
    @Mock
    private NotificationService notificationService;
    @Mock
    private LichSuHeThongRepository lichSuHeThongRepository;

    private SlaScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new SlaScheduler(workflowServiceClient, notificationService, lichSuHeThongRepository);
    }

    @Test
    void checkSla_shouldCreateOverdueNotification_forEachViolation() {
        SlaViolationClientItem item1 = overdueItem(1L, 10L, "Van ban 1", 2L, 5);
        SlaViolationClientItem item2 = overdueItem(2L, 11L, "Van ban 2", 3L, 10);
        LocalDate today = LocalDate.now();

        when(workflowServiceClient.getSlaViolations(isNull(), eq(today.toString()), isNull()))
            .thenReturn(List.of(item1, item2));
        when(workflowServiceClient.getSlaViolations(eq(today.plusDays(1).toString()), any(), isNull()))
            .thenReturn(List.of());

        scheduler.checkSla();

        ArgumentCaptor<NotificationCreateRequest> captor = ArgumentCaptor.forClass(NotificationCreateRequest.class);
        verify(notificationService, times(2)).create(captor.capture());

        List<NotificationCreateRequest> notifications = captor.getAllValues();
        assertThat(notifications).extracting(NotificationCreateRequest::loaiThongBao)
            .containsOnly("SLA_OVERDUE");
        assertThat(notifications).extracting(NotificationCreateRequest::nguoiNhanId)
            .containsExactlyInAnyOrder(2L, 3L);
        assertThat(notifications).extracting(NotificationCreateRequest::vanBanId)
            .containsExactlyInAnyOrder(10L, 11L);
    }

    @Test
    void checkSla_shouldCreateWarningNotification_forItemsDueSoon() {
        LocalDate today = LocalDate.now();
        SlaViolationClientItem warningItem = warningItem(5L, 20L, "Van ban sap het han", 7L);

        when(workflowServiceClient.getSlaViolations(isNull(), eq(today.toString()), isNull()))
            .thenReturn(List.of());
        when(workflowServiceClient.getSlaViolations(
                eq(today.plusDays(1).toString()),
                eq(today.plusDays(2).toString()),
                isNull()))
            .thenReturn(List.of(warningItem));

        scheduler.checkSla();

        ArgumentCaptor<NotificationCreateRequest> captor = ArgumentCaptor.forClass(NotificationCreateRequest.class);
        verify(notificationService, times(1)).create(captor.capture());

        NotificationCreateRequest req = captor.getValue();
        assertThat(req.loaiThongBao()).isEqualTo("SLA_WARNING");
        assertThat(req.nguoiNhanId()).isEqualTo(7L);
        assertThat(req.vanBanId()).isEqualTo(20L);
    }

    @Test
    void checkSla_shouldLogRunToLichSuHeThong() {
        LocalDate today = LocalDate.now();
        when(workflowServiceClient.getSlaViolations(isNull(), eq(today.toString()), isNull()))
            .thenReturn(List.of(overdueItem(1L, 10L, null, 2L, 3)));
        when(workflowServiceClient.getSlaViolations(eq(today.plusDays(1).toString()), any(), isNull()))
            .thenReturn(List.of());

        scheduler.checkSla();

        ArgumentCaptor<LichSuHeThong> logCaptor = ArgumentCaptor.forClass(LichSuHeThong.class);
        verify(lichSuHeThongRepository).save(logCaptor.capture());
        LichSuHeThong entry = logCaptor.getValue();
        assertThat(entry.getHanhDong()).isEqualTo("SLA_SCHEDULER_RUN");
        assertThat(entry.getNoiDungChiTiet()).contains("overdue=1");
        assertThat(entry.getNoiDungChiTiet()).contains("warning=0");
    }

    @Test
    void checkSla_shouldContinueOnIndividualNotificationFailure() {
        LocalDate today = LocalDate.now();
        SlaViolationClientItem item1 = overdueItem(1L, 10L, "Van ban 1", 2L, 5);
        SlaViolationClientItem item2 = overdueItem(2L, 11L, "Van ban 2", 3L, 10);

        when(workflowServiceClient.getSlaViolations(isNull(), eq(today.toString()), isNull()))
            .thenReturn(List.of(item1, item2));
        when(workflowServiceClient.getSlaViolations(eq(today.plusDays(1).toString()), any(), isNull()))
            .thenReturn(List.of());
        doThrow(new RuntimeException("DB error")).when(notificationService).create(
            any(NotificationCreateRequest.class));

        // Should not throw even when notifications fail
        scheduler.checkSla();

        verify(notificationService, times(2)).create(any(NotificationCreateRequest.class));
        verify(lichSuHeThongRepository).save(any(LichSuHeThong.class));
    }

    @Test
    void checkSla_shouldSkipNotification_whenNguoiNhanIdIsNull() {
        LocalDate today = LocalDate.now();
        SlaViolationClientItem itemWithNoRecipient = new SlaViolationClientItem(
            1L, 10L, "Van ban khong co nguoi nhan", null,
            LocalDateTime.now().minusDays(1), null, 24L
        );

        when(workflowServiceClient.getSlaViolations(isNull(), eq(today.toString()), isNull()))
            .thenReturn(List.of(itemWithNoRecipient));
        when(workflowServiceClient.getSlaViolations(eq(today.plusDays(1).toString()), any(), isNull()))
            .thenReturn(List.of());

        scheduler.checkSla();

        verify(notificationService, never()).create(any(NotificationCreateRequest.class));
    }

    private static SlaViolationClientItem overdueItem(
            Long processingId, Long documentId, String trichYeu, Long nguoiNhanId, long soGioTre) {
        return new SlaViolationClientItem(
            processingId, documentId, trichYeu, nguoiNhanId,
            LocalDateTime.now().minusHours(soGioTre), null, soGioTre
        );
    }

    private static SlaViolationClientItem warningItem(
            Long processingId, Long documentId, String trichYeu, Long nguoiNhanId) {
        return new SlaViolationClientItem(
            processingId, documentId, trichYeu, nguoiNhanId,
            LocalDateTime.now().plusDays(1), null, 0L
        );
    }
}
