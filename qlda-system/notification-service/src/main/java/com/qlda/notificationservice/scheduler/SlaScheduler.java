package com.qlda.notificationservice.scheduler;

import com.qlda.notificationservice.audit.entity.LichSuHeThong;
import com.qlda.notificationservice.audit.repository.LichSuHeThongRepository;
import com.qlda.notificationservice.client.WorkflowServiceClient;
import com.qlda.notificationservice.client.dto.SlaViolationClientItem;
import com.qlda.notificationservice.notification.dto.NotificationCreateRequest;
import com.qlda.notificationservice.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class SlaScheduler {

    private static final Logger log = LoggerFactory.getLogger(SlaScheduler.class);
    private static final String TYPE_SLA_OVERDUE  = "SLA_OVERDUE";
    private static final String TYPE_SLA_WARNING  = "SLA_WARNING";
    private static final String CHANNEL_SYSTEM    = "SYSTEM";

    private final WorkflowServiceClient workflowServiceClient;
    private final NotificationService notificationService;
    private final LichSuHeThongRepository lichSuHeThongRepository;

    public SlaScheduler(
            WorkflowServiceClient workflowServiceClient,
            NotificationService notificationService,
            LichSuHeThongRepository lichSuHeThongRepository) {
        this.workflowServiceClient = workflowServiceClient;
        this.notificationService = notificationService;
        this.lichSuHeThongRepository = lichSuHeThongRepository;
    }

    /** Runs every day at 08:00. */
    @Scheduled(cron = "0 0 8 * * ?")
    public void checkSla() {
        log.info("SlaScheduler: starting SLA check at {}", LocalDateTime.now());

        LocalDate today    = LocalDate.now();
        LocalDate warningTo = today.plusDays(2);

        int overdueCount = 0;
        int warningCount = 0;

        try {
            // Overdue: hanXuLy <= today AND not yet completed (or completed late)
            List<SlaViolationClientItem> overdue = workflowServiceClient
                    .getSlaViolations(null, today.toString(), null);
            if (overdue != null) {
                for (SlaViolationClientItem item : overdue) {
                    sendNotification(item, TYPE_SLA_OVERDUE,
                            "Văn bản quá hạn xử lý",
                            buildBody(item, "đã quá hạn " + item.soGioTre() + " giờ"));
                    overdueCount++;
                }
            }
        } catch (Exception ex) {
            log.warn("SlaScheduler: failed to fetch overdue SLA items", ex);
        }

        try {
            // Warning: hanXuLy between tomorrow and today+2 days AND not completed
            List<SlaViolationClientItem> warning = workflowServiceClient
                    .getSlaViolations(today.plusDays(1).toString(), warningTo.toString(), null);
            if (warning != null) {
                for (SlaViolationClientItem item : warning) {
                    sendNotification(item, TYPE_SLA_WARNING,
                            "Cảnh báo: văn bản sắp hết hạn",
                            buildBody(item, "sắp hết hạn trong vòng 2 ngày"));
                    warningCount++;
                }
            }
        } catch (Exception ex) {
            log.warn("SlaScheduler: failed to fetch warning SLA items", ex);
        }

        auditLog(overdueCount, warningCount);
        log.info("SlaScheduler: done — overdue={}, warning={}", overdueCount, warningCount);
    }

    private void sendNotification(SlaViolationClientItem item, String loai, String title, String body) {
        if (item.nguoiNhanId() == null) return;
        try {
            notificationService.create(new NotificationCreateRequest(
                    title,
                    body,
                    item.nguoiNhanId(),
                    item.documentId(),
                    loai,
                    CHANNEL_SYSTEM
            ));
        } catch (Exception ex) {
            log.warn("SlaScheduler: failed to create notification for nguoiNhanId={}, documentId={}",
                    item.nguoiNhanId(), item.documentId(), ex);
        }
    }

    private String buildBody(SlaViolationClientItem item, String statusPhrase) {
        String doc = item.trichYeu() != null ? "\"" + item.trichYeu() + "\"" : "ID=" + item.documentId();
        return "Văn bản " + doc + " " + statusPhrase + ".";
    }

    private void auditLog(int overdueCount, int warningCount) {
        try {
            LichSuHeThong entry = new LichSuHeThong();
            entry.setHanhDong("SLA_SCHEDULER_RUN");
            entry.setDoiTuong("SLA");
            entry.setNoiDungChiTiet("overdue=" + overdueCount + ", warning=" + warningCount);
            lichSuHeThongRepository.save(entry);
        } catch (Exception ex) {
            log.warn("SlaScheduler: failed to write audit log", ex);
        }
    }
}
