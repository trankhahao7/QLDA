package com.qlda.notificationservice.notification.sender;

import com.qlda.notificationservice.notification.dto.NotificationResponse;
import com.qlda.notificationservice.notification.dto.kafka.NotificationEvent;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class TeamsNotificationSender implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(TeamsNotificationSender.class);

    private final String webhookUrl;
    private final RestClient restClient;

    public TeamsNotificationSender(
            @Value("${app.notification.teams.webhook-url:}") String webhookUrl) {
        this.webhookUrl = webhookUrl;
        this.restClient = RestClient.create();
    }

    @Override
    public String channel() {
        return "TEAMS";
    }

    @Override
    public void send(NotificationEvent event, NotificationResponse notification) {
        if (!StringUtils.hasText(webhookUrl)) {
            log.debug("Teams webhook URL not configured, skipping for eventId={}", event.eventId());
            return;
        }

        Map<String, Object> payload = buildMessageCard(event);

        try {
            restClient.post()
                    .uri(webhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Sent Teams notification for eventId={}, notificationId={}", event.eventId(), notification.id());
        } catch (Exception ex) {
            log.error("Teams webhook failed for eventId={}: {}", event.eventId(), ex.getMessage(), ex);
            throw new RuntimeException("Teams webhook delivery failed: " + ex.getMessage(), ex);
        }
    }

    private Map<String, Object> buildMessageCard(NotificationEvent event) {
        String title = event.tieuDe() != null ? event.tieuDe() : "eOIS Thông báo";
        String content = event.noiDung() != null ? event.noiDung() : "";
        String loai = event.loaiThongBao() != null ? event.loaiThongBao() : "SYSTEM";

        Map<String, Object> section = Map.of(
                "activityTitle", "**eOIS — Thông báo hệ thống**",
                "activitySubtitle", title,
                "facts", List.of(
                        Map.of("name", "Loại thông báo:", "value", loai),
                        Map.of("name", "Nội dung:", "value", content)
                ),
                "markdown", true
        );

        return Map.of(
                "@type", "MessageCard",
                "@context", "http://schema.org/extensions",
                "themeColor", themeColor(loai),
                "summary", title,
                "sections", List.of(section)
        );
    }

    private String themeColor(String loaiThongBao) {
        return switch (loaiThongBao.toUpperCase()) {
            case "SLA_WARNING", "WARNING" -> "FFA500";
            case "SLA_OVERDUE", "OVERDUE", "ERROR" -> "D13438";
            case "SUCCESS" -> "107C10";
            default -> "0076D7";
        };
    }
}
