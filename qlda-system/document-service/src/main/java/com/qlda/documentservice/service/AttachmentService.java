package com.qlda.documentservice.service;

import com.qlda.documentservice.dto.response.DocumentResponses;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface AttachmentService {
    DocumentResponses.AttachmentResponse upload(Long documentId, MultipartFile file);

    List<DocumentResponses.AttachmentResponse> list(Long documentId);

    DocumentResponses.AttachmentDownloadResponse download(Long attachmentId);

    Resource getFile(Long attachmentId);

    DocumentResponses.IdResponse delete(Long attachmentId);
}

