package com.qlda.notificationservice.client.dto;

import java.time.LocalDateTime;

public record SlaViolationClientItem(
    Long processingId,
    Long documentId,
    String trichYeu,
    Long nguoiNhanId,
    LocalDateTime hanXuLy,
    LocalDateTime ngayHoanThanh,
    long soGioTre
) {
}
