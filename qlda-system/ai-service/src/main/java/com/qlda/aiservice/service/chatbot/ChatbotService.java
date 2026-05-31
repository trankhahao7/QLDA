package com.qlda.aiservice.service.chatbot;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlda.aiservice.client.AuthInternalApiService;
import com.qlda.aiservice.client.DocumentInternalApiService;
import com.qlda.aiservice.client.WorkflowInternalApiService;
import com.qlda.aiservice.dto.request.ChatbotAskRequest;
import com.qlda.aiservice.entity.AiDocumentChunkEntity;
import com.qlda.aiservice.entity.AiProcessType;
import com.qlda.aiservice.entity.AiResultEntity;
import com.qlda.aiservice.exception.AppException;
import com.qlda.aiservice.exception.ErrorCode;
import com.qlda.aiservice.repository.AiResultRepository;
import com.qlda.aiservice.service.EmbeddingService;
import com.qlda.aiservice.service.VectorSearchService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ChatbotService {

    private static final String NO_DATA_MESSAGE = "Không tìm thấy dữ liệu phù hợp.";
    private static final int DUE_SOON_DAYS = 3;

    private final AiResultRepository aiResultRepository;
    private final EmbeddingService embeddingService;
    private final VectorSearchService vectorSearchService;
    private final ChatbotLlmService chatbotLlmService;
    private final DocumentInternalApiService documentInternalApiService;
    private final WorkflowInternalApiService workflowInternalApiService;
    private final AuthInternalApiService authInternalApiService;
    private final ChatbotIntentDetector chatbotIntentDetector;
    private final ChatbotPromptBuilder chatbotPromptBuilder;
    private final ChatbotResultMapper chatbotResultMapper;
    private final ObjectMapper objectMapper;
    private final int topK;

    public ChatbotService(
        AiResultRepository aiResultRepository,
        EmbeddingService embeddingService,
        VectorSearchService vectorSearchService,
        ChatbotLlmService chatbotLlmService,
        DocumentInternalApiService documentInternalApiService,
        WorkflowInternalApiService workflowInternalApiService,
        AuthInternalApiService authInternalApiService,
        ChatbotIntentDetector chatbotIntentDetector,
        ChatbotPromptBuilder chatbotPromptBuilder,
        ChatbotResultMapper chatbotResultMapper,
        ObjectMapper objectMapper,
        @Value("${CHATBOT_TOP_K:5}") int topK
    ) {
        this.aiResultRepository = aiResultRepository;
        this.embeddingService = embeddingService;
        this.vectorSearchService = vectorSearchService;
        this.chatbotLlmService = chatbotLlmService;
        this.documentInternalApiService = documentInternalApiService;
        this.workflowInternalApiService = workflowInternalApiService;
        this.authInternalApiService = authInternalApiService;
        this.chatbotIntentDetector = chatbotIntentDetector;
        this.chatbotPromptBuilder = chatbotPromptBuilder;
        this.chatbotResultMapper = chatbotResultMapper;
        this.objectMapper = objectMapper;
        this.topK = topK;
    }

    public Map<String, Object> ask(ChatbotAskRequest request) {
        try {
            IntentDetectionResult detectionResult = chatbotIntentDetector.detect(request.question());
            ChatbotExecution execution = switch (detectionResult.intent()) {
                case DOCUMENT_SEARCH -> processDocumentSearch(request);
                case SYSTEM_STATISTIC -> processSystemStatistic(request, detectionResult.metricCode());
                case USER_GUIDE -> processUserGuide(request);
                case GENERAL_HELP -> processGeneralHelp(request);
            };

            AiResultEntity saved = saveResult(request, detectionResult, execution);

            return chatbotResultMapper.toResponse(
                saved.getId(),
                detectionResult.intent(),
                detectionResult.metricCode(),
                request.question(),
                execution.answer(),
                execution.value(),
                execution.sources(),
                execution.modelUsed(),
                execution.confidence()
            );
        } catch (AppException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new AppException(ErrorCode.CHATBOT_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, "Chatbot processing failed", ex);
        }
    }

    private ChatbotExecution processDocumentSearch(ChatbotAskRequest request) {
        List<Double> queryEmbedding = embeddingService.generateEmbedding(request.question());
        Long contextDocumentId = extractDocumentId(request.context());

        List<AiDocumentChunkEntity> rankedChunks = vectorSearchService.findTopKBySimilarity(
            queryEmbedding, contextDocumentId, topK * 3
        );
        List<AiDocumentChunkEntity> accessibleChunks = filterByAccess(request.userId(), contextDocumentId, rankedChunks);
        List<AiDocumentChunkEntity> topChunks = accessibleChunks.stream().limit(topK).toList();

        if (topChunks.isEmpty()) {
            return new ChatbotExecution(NO_DATA_MESSAGE, null, List.of(), "system", 100.0);
        }

        String retrievedDocuments = topChunks.stream()
            .map(AiDocumentChunkEntity::getNoiDung)
            .reduce("", (a, b) -> a + "\n" + b)
            .trim();
        String userPrompt = chatbotPromptBuilder.buildDocumentSearchPrompt(request.question(), retrievedDocuments);
        ChatbotLlmResponse llmResponse = chatbotLlmService.generateAnswer(
            chatbotPromptBuilder.systemPrompt(), userPrompt, request.question()
        );
        return new ChatbotExecution(
            llmResponse.answer(), null, mapSources(topChunks),
            llmResponse.modelUsed(), llmResponse.confidence()
        );
    }

    private ChatbotExecution processUserGuide(ChatbotAskRequest request) {
        List<Double> queryEmbedding = embeddingService.generateEmbedding(request.question());
        List<AiDocumentChunkEntity> rankedChunks = vectorSearchService.findTopKUserGuide(queryEmbedding, topK);

        if (rankedChunks.isEmpty()) {
            return new ChatbotExecution(NO_DATA_MESSAGE, null, List.of(), "system", 100.0);
        }

        String guideContext = rankedChunks.stream()
            .map(AiDocumentChunkEntity::getNoiDung)
            .reduce("", (a, b) -> a + "\n" + b)
            .trim();
        String userPrompt = chatbotPromptBuilder.buildUserGuidePrompt(request.question(), guideContext);
        ChatbotLlmResponse llmResponse = chatbotLlmService.generateAnswer(
            chatbotPromptBuilder.systemPrompt(), userPrompt, request.question()
        );
        return new ChatbotExecution(
            llmResponse.answer(), null, mapSources(rankedChunks),
            llmResponse.modelUsed(), llmResponse.confidence()
        );
    }

    private ChatbotExecution processGeneralHelp(ChatbotAskRequest request) {
        ChatbotLlmResponse llmResponse = chatbotLlmService.generateAnswer(
            chatbotPromptBuilder.generalHelpSystemPrompt(),
            chatbotPromptBuilder.buildGeneralHelpPrompt(request.question()),
            request.question()
        );
        return new ChatbotExecution(llmResponse.answer(), null, List.of(), llmResponse.modelUsed(), llmResponse.confidence());
    }

    private ChatbotExecution processSystemStatistic(ChatbotAskRequest request, ChatbotMetricCode metricCode) {
        if (metricCode == null) {
            return new ChatbotExecution(NO_DATA_MESSAGE, null, List.of(), "system", 100.0);
        }
        long value = switch (metricCode) {
            case MY_UPLOADED_DOCUMENT_COUNT -> documentInternalApiService.getMyUploadedDocumentCount(request.userId());
            case MY_DUE_SOON_DOCUMENT_COUNT -> workflowInternalApiService.getMyDueSoonDocumentCount(request.userId(), DUE_SOON_DAYS);
            case MY_OVERDUE_DOCUMENT_COUNT -> workflowInternalApiService.getMyOverdueDocumentCount(request.userId());
            case TOTAL_DOCUMENT_COUNT -> documentInternalApiService.getTotalDocumentCount();
            case TOTAL_USER_COUNT -> getTotalUserCountWithPermissionCheck(request.userId());
        };
        String userPrompt = chatbotPromptBuilder.buildStatisticPrompt(request.question(), metricCode, value);
        ChatbotLlmResponse llmResponse = chatbotLlmService.generateAnswer(
            chatbotPromptBuilder.systemPrompt(), userPrompt, request.question()
        );
        return new ChatbotExecution(llmResponse.answer(), value, List.of(), llmResponse.modelUsed(), llmResponse.confidence());
    }

    private long getTotalUserCountWithPermissionCheck(Long userId) {
        if (!authInternalApiService.hasSystemStatisticPermission(userId)) {
            throw new AppException(ErrorCode.CHATBOT_FAILED, HttpStatus.FORBIDDEN, "User has no permission for TOTAL_USER_COUNT");
        }
        return authInternalApiService.getTotalUserCount(userId);
    }

    private List<AiDocumentChunkEntity> filterByAccess(Long userId, Long contextDocumentId, List<AiDocumentChunkEntity> chunks) {
        LinkedHashMap<Long, Boolean> docIds = new LinkedHashMap<>();
        for (AiDocumentChunkEntity chunk : chunks) {
            if (chunk.getVanBanId() != null) docIds.put(chunk.getVanBanId(), true);
        }
        if (contextDocumentId != null) docIds.put(contextDocumentId, true);
        if (docIds.isEmpty()) return chunks;

        try {
            Set<Long> allowed = documentInternalApiService.checkDocumentAccess(
                userId, new ArrayList<>(docIds.keySet())
            );
            return chunks.stream()
                .filter(c -> allowed.contains(c.getVanBanId()))
                .toList();
        } catch (Exception ex) {
            return chunks;
        }
    }

    private List<Map<String, Object>> mapSources(List<AiDocumentChunkEntity> chunks) {
        List<Map<String, Object>> sources = new ArrayList<>();
        for (AiDocumentChunkEntity chunk : chunks) {
            Map<String, Object> source = new LinkedHashMap<>();
            source.put("documentId", chunk.getVanBanId());
            source.put("chunkId", chunk.getId());
            source.put("matchedText", chunk.getNoiDung());
            Map<String, Object> metadata = fromJsonMap(chunk.getMetadata());
            Object title = metadata.get("title") != null ? metadata.get("title") : metadata.get("trichYeu");
            if (title != null) source.put("title", title);
            Object type = metadata.get("type");
            source.put("reference", type == null ? "DOCUMENT" : String.valueOf(type));
            sources.add(source);
        }
        return sources;
    }

    private AiResultEntity saveResult(
        ChatbotAskRequest request,
        IntentDetectionResult detectionResult,
        ChatbotExecution execution
    ) {
        Map<String, Object> noteData = new LinkedHashMap<>();
        noteData.put("intent", detectionResult.intent().name());
        if (detectionResult.metricCode() != null) noteData.put("metricCode", detectionResult.metricCode().name());
        if (!execution.sources().isEmpty()) noteData.put("sources", execution.sources());

        AiResultEntity entity = AiResultEntity.builder()
            .vanBanID(extractDocumentId(request.context()))
            .nguoiYeuCauID(request.userId())
            .loaiXuLyAI(AiProcessType.CHATBOT)
            .noiDungDauVao(request.question())
            .ketQuaTraVe(execution.answer())
            .doTinCay(execution.confidence())
            .modelSuDung(execution.modelUsed())
            .thoiGianXuLy(LocalDateTime.now())
            .ghiChu(toJson(noteData))
            .build();
        return aiResultRepository.save(entity);
    }

    private String toJson(Object input) {
        try { return objectMapper.writeValueAsString(input); }
        catch (JsonProcessingException ex) { return "{}"; }
    }

    private Long extractDocumentId(Map<String, Object> context) {
        if (context == null) return null;
        Object documentId = context.get("documentId");
        if (documentId instanceof Number n) return n.longValue();
        if (documentId instanceof String s && !s.isBlank()) return Long.parseLong(s);
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fromJsonMap(String json) {
        if (json == null || json.isBlank()) return Map.of();
        try { return objectMapper.readValue(json, Map.class); }
        catch (Exception ex) { return Map.of(); }
    }

    private record ChatbotExecution(
        String answer,
        Long value,
        List<Map<String, Object>> sources,
        String modelUsed,
        double confidence
    ) {}
}
