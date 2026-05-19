# Hệ Thống Quản Lý Văn Bản (QLDA)

Hệ thống quản lý văn bản toàn diện với kiến trúc microservices, hỗ trợ quy trình phê duyệt, tích hợp AI và Office 365.

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
- [Các Module](#-các-module)
- [API Endpoints](#-api-endpoints)
- [Frontend](#-frontend)
- [Tích Hợp & Mở Rộng](#-tích-hợp--mở-rộng)
- [Phát Triển](#-phát-triển)
- [Triển Khai Docker](#-triển-khai-docker)

---

## 🏛 Giới Thiệu

**QLDA** là hệ thống quản lý văn bản điện tử được xây dựng trên kiến trúc **microservices** với Spring Boot, cho phép:

- **Quản lý văn bản đến/văn bản đi**: Tiếp nhận, phân loại, xử lý, trình ký, ban hành
- **Quy trình phê duyệt**: Luồng phê duyệt đa cấp, chuyển tiếp, ủy quyền
- **Trợ lý AI**: Chatbot thông minh với Gemini AI, tìm kiếm ngữ nghĩa bằng vector embedding
- **Tích hợp Office 365**: Đồng bộ SharePoint, gửi email Outlook, thông báo Teams
- **Báo cáo & Thống kê**: Dashboard trực quan, xuất Excel/PDF
- **Quản lý người dùng & phân quyền**: Role-based access control, đăng nhập Azure AD

---

## 🛠 Công Nghệ Sử Dụng

### Backend

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| Java | 21 | Ngôn ngữ lập trình |
| Spring Boot | 4.0.6 | Framework chính |
| Spring Cloud | 2025.1.1 | Microservices orchestration |
| Spring Security + OAuth2 | - | Xác thực & phân quyền JWT |
| Spring Cloud Gateway | - | API Gateway |
| Netflix Eureka | - | Service Discovery |
| Spring Cloud OpenFeign | - | Giao tiếp nội bộ giữa các service |
| Apache Kafka | 7.5.0 | Message queue (thông báo, audit) |
| PostgreSQL 17 | pgvector | Cơ sở dữ liệu chính + vector search |
| Hibernate | - | ORM |
| Spring Data JPA | - | Truy vấn dữ liệu |
| Springdoc OpenAPI | 3.0.3 | Tài liệu API tự động |
| Bucket4j | 8.10.1 | Rate limiting |
| JSON Web Token (jjwt) | 0.12.7 | JWT xác thực |
| Spring Mail | - | Gửi email (Outlook SMTP) |

### Frontend

| Công Nghệ | Phiên Bản |
|-----------|-----------|
| React | 19.2.5 |
| TypeScript | 6.0.2 |
| Vite | 8.0.10 |
| React Router | 7.9.3 |
| MSAL (Azure AD) | 5.9.0 |

### AI & Machine Learning

| Công Nghệ | Mục Đích |
|-----------|----------|
| Google Gemini API (gemini-2.5-flash) | Chatbot, phân loại, tóm tắt |
| pgvector | Lưu trữ và tìm kiếm vector embedding (768 chiều) |
| IVFFlat Index | Tối ưu tìm kiếm vector |

### DevOps

| Công Nghệ | Mục Đích |
|-----------|----------|
| Docker & Docker Compose | Container hóa toàn bộ hệ thống |
| Maven | Build tool |
| Git | Version control |
| GitHub Actions | CI/CD |

---

## 🏗 Kiến Trúc Hệ Thống

```
                                ┌─────────────────┐
                                │   Frontend       │
                                │  (React + Vite)  │
                                │   Port: 5173     │
                                └────────┬────────┘
                                         │ HTTP
                                         ▼
                                ┌─────────────────┐
                                │   API Gateway    │
                                │  (Spring Cloud)  │
                                │   Port: 8080     │
                                └──┬──┬──┬──┬──┬──┘
                                   │  │  │  │  │
            ┌──────────────────────┘  │  │  │  └──────────────────────┐
            │                         │  │  │                        │
            ▼                         ▼  ▼  ▼                        ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ Auth Service │   │Document Svc  │   │ Workflow Svc │   │   AI Service │
    │   Port:8081  │   │  Port:8082   │   │  Port:8083   │   │  Port:8084   │
    │              │   │              │   │              │   │              │
    │•JWT  •Azure  │   │•CRUD văn bản │   │•Quy trình    │   │•Gemini API   │
    │•Users •Roles │   │•Tep đính kèm │   │•Phê duyệt    │   │•Chatbot      │
    │•Đơn vị       │   │•OCR •Số hóa  │   │•SLA •Nhắc    │   │•Vectors      │
    └──────┬───────┘   └──────┬───────┘   └──────┬───────┘   │•Phân loại    │
           │                  │                  │           └──────────────┘
           │                  │                  │
           │                  │                  │           ┌──────────────────┐
           └──────────────────┼──────────────────┼───────────│ Notification Svc │
                              │                  │           │   Port:8085      │
                              │                  │           │                  │
                              ▼                  ▼           │•Email (Outlook)  │
                    ┌──────────────────┐                      │•Teams •Audit    │
                    │     Kafka        │                      │•Báo cáo         │
                    │  (Message Queue) │                      └──────────────────┘
                    └──────────────────┘

                    ┌──────────────────────────────────────┐
                    │            Eureka Server             │
                    │          Service Registry            │
                    │            Port: 8761               │
                    └──────────────────────────────────────┘

                    ┌──────────────────────────────────────┐
                    │         PostgreSQL + pgvector        │
                    │            Port: 5432               │
                    └──────────────────────────────────────┘
```

### Luồng Xác Thực

```
Người dùng → Azure AD Login → Auth Service (JWT) → API Gateway → Các Service
                                                              ↓
                                                    Kiểm tra JWT (RSA Public Key)
```

---

## 📋 Yêu Cầu Hệ Thống

- **Java** 21+
- **Node.js** 20+
- **Maven** 3.9+
- **Docker** & **Docker Compose** (cho triển khai container)
- **PostgreSQL** 17 (nếu chạy không dùng Docker)
- **Apache Kafka** 3.x (nếu chạy không dùng Docker)
- **Gemini API Key** (từ Google AI Studio)

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Clone Repository

```bash
git clone https://github.com/your-org/qlda-system.git
cd QLDA_system
```

### 2. Cấu Hình Môi Trường

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Các biến môi trường quan trọng:

| Biến | Mô Tả | Giá Trị Mặc Định |
|------|-------|------------------|
| `DB_URL` | URL kết nối PostgreSQL | `jdbc:postgresql://localhost:5432/QLDA` |
| `DB_USERNAME` | Tên đăng nhập DB | `postgres` |
| `DB_PASSWORD` | Mật khẩu DB | `123456` |
| `EUREKA_SERVER_URL` | Eureka server URL | `http://localhost:8761/eureka` |
| `GEMINI_API_KEY` | Google Gemini API Key | (bắt buộc) |
| `AUTH_JWT_PRIVATE_KEY` | RSA private key | `classpath:private.pem` |
| `AUTH_JWT_PUBLIC_KEY` | RSA public key | `classpath:public.pem` |
| `AZURE_TENANT_ID` | Azure AD Tenant ID | (nếu dùng Azure AD) |
| `AZURE_CLIENT_ID` | Azure AD Client ID | (nếu dùng Azure AD) |
| `INTERNAL_SERVICE_TOKEN` | Token nội bộ giữa các service | `change-me-in-dev` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka server | `localhost:9092` |

### 3. Khởi Chạy Với Docker (Khuyên Dùng)

Toàn bộ hệ thống được khởi chạy chỉ với một lệnh:

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động tất cả các service theo đúng thứ tự phụ thuộc:
1. PostgreSQL (pgvector) + Zookeeper + Kafka
2. Eureka Server
3. Auth Service
4. Các service còn lại (document, workflow, ai, notification)
5. API Gateway

Kiểm tra trạng thái:

```bash
docker-compose ps
```

### 4. Khởi Chạy Thủ Công (Development)

#### Bước 1: Khởi động Infrastructure

```bash
# PostgreSQL với pgvector
docker run -d --name qlda-postgres -p 5432:5432 -e POSTGRES_DB=QLDA -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=123456 pgvector/pgvector:pg17

# Kafka
docker run -d --name qlda-zookeeper -p 2181:2181 confluentinc/cp-zookeeper:7.5.0
docker run -d --name qlda-kafka -p 9092:9092 --link qlda-zookeeper confluentinc/cp-kafka:7.5.0
```

#### Bước 2: Khởi tạo Database

```bash
# Chạy script tạo bảng
psql -U postgres -d QLDA -f qlda-system/qlda.sql

# Seed dữ liệu mẫu
psql -U postgres -d QLDA -f qlda-system/qlda_seed.sql

# Tạo bảng AI vector
psql -U postgres -d QLDA -f qlda-system/AI.sql

# Seed dữ liệu AI chunks
psql -U postgres -d QLDA -f qlda-system/seed_chunks.sql
```

#### Bước 3: Khởi động Eureka Server

```bash
cd qlda-system/service-registry
mvn spring-boot:run
```

#### Bước 4: Khởi động các Service

Mở terminal riêng cho mỗi service:

```bash
# Auth Service (port 8081)
cd qlda-system/auth-service
mvn spring-boot:run

# Document Service (port 8082)
cd qlda-system/document-service
mvn spring-boot:run

# Workflow Service (port 8083)
cd qlda-system/workflow-service
mvn spring-boot:run

# AI Service (port 8084)
cd qlda-system/ai-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Notification Service (port 8085)
cd qlda-system/notification-service
mvn spring-boot:run

# API Gateway (port 8080)
cd qlda-system/api-gateway
mvn spring-boot:run
```

#### Bước 5: Khởi động Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`.

### 5. Truy Cập Hệ Thống

| Thành Phần | URL |
|------------|-----|
| Frontend | `http://localhost:5173` |
| API Gateway | `http://localhost:8080` |
| Eureka Dashboard | `http://localhost:8761` |
| Swagger UI (Auth) | `http://localhost:8081/swagger-ui.html` |
| Swagger UI (Document) | `http://localhost:8082/swagger-ui.html` |
| Swagger UI (Workflow) | `http://localhost:8083/swagger-ui.html` |
| Swagger UI (Notification) | `http://localhost:8085/swagger-ui.html` |

### Tài Khoản Mặc Định (Development)

| Tài Khoản | Vai Trò |
|-----------|---------|
| `admin` | Quản trị hệ thống |
| `nguyenvana` | Chuyên viên |
| `truongdv` | Trưởng phòng |
| `icetruong` | Lãnh đạo |

---

## 📦 Các Module

### 1. Auth Service (`auth-service`) — Port 8081

Dịch vụ xác thực và quản lý người dùng.

**Chức năng chính:**
- Đăng nhập/đăng xuất (JWT + Azure AD / OAuth2)
- Quản lý người dùng (CRUD)
- Quản lý đơn vị/phòng ban (cấu trúc cây)
- Phân quyền (Role-Based Access Control)
- Audit log
- Tích hợp Azure AD & Office 365
- Sao lưu & phục hồi dữ liệu
- Quản lý chính sách bảo mật

### 2. Document Service (`document-service`) — Port 8082

Dịch vụ quản lý văn bản.

**Chức năng chính:**
- Quản lý văn bản đến (tiếp nhận, phân loại, xử lý)
- Quản lý văn bản đi (soạn thảo, trình ký, ban hành)
- Quản lý file đính kèm
- Quản lý mẫu văn bản (template)
- Quản lý loại văn bản
- Quản lý hồ sơ công việc
- OCR nhận dạng văn bản
- Đánh số văn bản tự động
- Quản lý phiên bản văn bản

### 3. Workflow Service (`workflow-service`) — Port 8083

Dịch vụ quy trình và luồng công việc.

**Chức năng chính:**
- Định nghĩa quy trình xử lý
- Quản lý các bước trong quy trình
- Xử lý luồng phê duyệt
- Theo dõi SLA và hạn xử lý
- Nhắc việc tự động
- Ủy quyền xử lý
- Timeline theo dõi tiến độ

### 4. AI Service (`ai-service`) — Port 8084

Dịch vụ trí tuệ nhân tạo tích hợp Google Gemini.

**Chức năng chính:**
- **Chatbot thông minh**: Trả lời câu hỏi dựa trên dữ liệu văn bản và kiến thức hệ thống
- **RAG (Retrieval-Augmented Generation)**: Tìm kiếm ngữ nghĩa bằng vector embedding (pgvector)
- **Phân loại văn bản**: Tự động phân loại nội dung
- **Tóm tắt văn bản**: Tạo tóm tắt nội dung
- **Gợi ý trả lời**: Đề xuất nội dung trả lời cho văn bản đến
- **Trích xuất metadata**: Tự động trích xuất thông tin từ văn bản
- **Rate limiting**: Bucket4j, 10 requests/phút

**Các loại intent chatbot:**
| Intent | Mô Tả | Ví Dụ |
|--------|-------|-------|
| `DOCUMENT_SEARCH` | Tìm kiếm văn bản | "Tìm văn bản về phân bổ kinh phí" |
| `SYSTEM_STATISTIC` | Thống kê hệ thống | "Có bao nhiêu văn bản quá hạn?" |
| `USER_GUIDE` | Hướng dẫn sử dụng | "Hướng dẫn tạo văn bản mới" |
| `GENERAL_HELP` | Câu hỏi chung | "Bạn có thể làm gì?" |

### 5. Notification Service (`notification-service`) — Port 8085

Dịch vụ thông báo và báo cáo.

**Chức năng chính:**
- Thông báo trong ứng dụng
- Gửi email qua Outlook SMTP
- Thông báo Microsoft Teams
- Audit log hệ thống
- Báo cáo & thống kê dashboard
- Xử lý sự kiện Kafka (kèm Dead Letter Queue)
- Xuất báo cáo Excel/PDF

### 6. API Gateway (`api-gateway`) — Port 8080

Cổng vào duy nhất cho tất cả request.

**Chức năng chính:**
- Định tuyến request đến các service
- Forward JWT token
- Ghi log request/response
- Rate limiting
- Service discovery qua Eureka

### 7. Service Registry (`service-registry`) — Port 8761

Eureka server cho service discovery.

---

## 🔌 API Endpoints

### Gateway Routes

| Method | Path | Service |
|--------|------|---------|
| `/**` | `/api/auth/**` | Auth Service |
| `/**` | `/api/ai/**` | AI Service |
| `/**` | `/api/documents/**` | Document Service |
| `/**` | `/api/workflows/**` | Workflow Service |
| `/**` | `/api/notifications/**` | Notification Service |
| `/**` | `/api/audit-logs/**` | Notification Service |
| `/**` | `/api/reports/**` | Notification Service |

### Chatbot API

```http
POST /api/ai/chatbot/ask
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "userId": 1001,
  "question": "Hướng dẫn đăng nhập hệ thống",
  "context": {
    "module": "huong_dan",
    "documentId": null
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Chatbot response successfully",
  "data": {
    "resultId": 123,
    "intent": "USER_GUIDE",
    "question": "Hướng dẫn đăng nhập hệ thống",
    "answer": "Bước 1: Truy cập https://portal.qlda.vn...",
    "sources": [
      {
        "documentId": 5001,
        "chunkId": 1,
        "score": 0.85,
        "matchedText": "Hướng dẫn đăng nhập..."
      }
    ],
    "modelUsed": "gemini-2.5-flash",
    "confidence": 0.95
  }
}
```

### API Response Format

Tất cả API đều trả về định dạng thống nhất:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {},
  "errorCode": null
}
```

---

## 🎨 Frontend

### Cấu Trúc Thư Mục

```
frontend/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component với routes
├── index.css, App.css          # Global styles
├── routes/
│   ├── user/                   # Trang người dùng
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Inbox.tsx
│   │   ├── Search.tsx
│   │   ├── Upload.tsx
│   │   ├── Profile.tsx
│   │   └── DocumentDetail.tsx
│   └── admin/                  # Trang quản trị
│       ├── AdminDashboard.tsx
│       ├── UserManagement.tsx
│       ├── PermissionManagement.tsx
│       └── ... (8 modules)
├── services/                   # API clients
│   ├── core/apiClient.ts       # HTTP client (fetch wrapper)
│   ├── auth/                   # Auth API
│   ├── ai/                     # AI / Chatbot API
│   ├── documents/              # Document API
│   └── ... (các service khác)
├── shared/                     # Components dùng chung
│   ├── AppShell.tsx
│   ├── AdminShell.tsx
│   ├── Sidebar.tsx
│   ├── AdminSidebar.tsx
│   └── ChatBot.tsx             # Chatbot widget (RAG)
├── config/                     # Cấu hình
│   ├── admin.config.ts
│   └── msal.config.ts          # Azure AD MSAL config
└── styles/
    └── app.css                 # Tất cả styles
```

### Routes

| Route | Component | Mô Tả |
|-------|-----------|-------|
| `/login` | Login | Đăng nhập (Azure AD) |
| `/dashboard` | Dashboard | Bảng điều khiển |
| `/inbox` | Inbox | Văn bản đến |
| `/upload` | Upload | Tải lên văn bản |
| `/search` | Search | Tra cứu văn bản |
| `/profile` | Profile | Thông tin cá nhân |
| `/documents/:id` | DocumentDetail | Chi tiết văn bản |
| `/admin/dashboard` | AdminDashboard | Dashboard quản trị |
| `/admin/users` | UserManagement | Quản lý người dùng |
| `/admin/permissions` | PermissionManagement | Phân quyền |
| `/admin/units` | UnitManagement | Đơn vị/phòng ban |

### Tính Năng Chatbot

Chatbot được tích hợp dưới dạng widget ở góc phải màn hình:
- **Nhấn nút "AI"** để mở
- **Gõ câu hỏi** về hệ thống, văn bản, hướng dẫn
- **Chatbot trả lời** dựa trên RAG (document chunks) + Gemini AI
- Câu hỏi không có pattern sẽ được Gemini trả lời trực tiếp
- **Debug Panel**: Nhấn "D" để xem log request/response chi tiết

---

## 🔧 Tích Hợp & Mở Rộng

### Azure Active Directory

Hệ thống hỗ trợ đăng nhập qua Azure AD (OAuth 2.0):
1. Cấu hình `AZURE_TENANT_ID`, `AZURE_CLIENT_ID` trong `.env`
2. Đăng ký Redirect URI: `http://localhost:5173/login`
3. Cấu hình MSAL trong `frontend/src/config/msal.config.ts`

### Office 365

Tích hợp SharePoint, Teams, Outlook:
1. Cấu hình `OFFICE365_TENANT_ID`, `OFFICE365_CLIENT_ID`, `OFFICE365_CLIENT_SECRET`
2. Tích hợp SharePoint: đồng bộ văn bản lên SharePoint
3. Tích hợp Teams: gửi thông báo qua Teams webhook
4. Tích hợp Outlook: gửi email qua SMTP

### Gemini AI

Cấu hình AI chatbot:
1. Lấy API Key từ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set biến môi trường `GEMINI_API_KEY`
3. Cấu hình model (`gemini-2.5-flash`) và rate limit trong `application.properties`

### Cơ Sở Dữ Liệu Vector (pgvector)

Để thêm dữ liệu cho chatbot RAG:
1. Chèn dữ liệu vào bảng `ai_document_chunk`
2. Mỗi chunk gồm: `van_ban_id`, `noi_dung`, `embedding` (vector 768 chiều), `metadata` (JSON)
3. Sử dụng file `seed_chunks.sql` làm mẫu

---

## 👨‍💻 Phát Triển

### Clone & Cài Đặt

```bash
git clone https://github.com/your-org/qlda-system.git
cd QLDA_system

# Cài đặt dependencies frontend
cd frontend && npm install && cd ..
```

### Chạy Development

Sử dụng Docker cho infrastructure, chạy service thủ công:

```bash
# Infrastructure
docker-compose up -d postgres zookeeper kafka

# Eureka
cd qlda-system/service-registry && mvn spring-boot:run

# Các service (mỗi service một terminal)
cd qlda-system/auth-service && mvn spring-boot:run
cd qlda-system/document-service && mvn spring-boot:run
cd qlda-system/workflow-service && mvn spring-boot:run
cd qlda-system/ai-service && mvn spring-boot:run
cd qlda-system/notification-service && mvn spring-boot:run
cd qlda-system/api-gateway && mvn spring-boot:run

# Frontend
cd frontend && npm run dev
```

### Build

```bash
# Build tất cả services
cd qlda-system/<service-name>
mvn clean package -DskipTests

# Build frontend
cd frontend
npm run build
```

### Chạy Kiểm Thử

```bash
# Chạy test cho một service
cd qlda-system/<service-name>
mvn test
```

### Coding Conventions

- **Java**: Spring Boot conventions, constructor injection (`@RequiredArgsConstructor`)
- **TypeScript**: React 19 hooks, TypeScript strict mode
- **API Response**: Format thống nhất `{ success, message, data, errorCode }`
- **Database**: Flyway-style migrations qua SQL scripts
- **Commit**: Conventional Commits (`feat:`, `fix:`, `refactor:`)

---

## 🐳 Triển Khai Docker

### Docker Compose

File `docker-compose.yml` định nghĩa đầy đủ 11 containers:

```bash
# Khởi động toàn bộ hệ thống
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng hệ thống
docker-compose down

# Dừng và xóa volumes (xóa dữ liệu)
docker-compose down -v
```

### Build Images Riêng

```bash
docker build -t qlda-ai-service ./qlda-system/ai-service
docker build -t qlda-auth-service ./qlda-system/auth-service
```

### Môi Trường Triển Khai

| Biến | Mô Tả |
|------|-------|
| `SPRING_PROFILES_ACTIVE` | `dev`, `prod` |
| `SERVER_PORT` | Port cho mỗi service |
| `EUREKA_ENABLED` | `true`/`false` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker URL |

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📝 License

This project is proprietary software.

---

## 📞 Hỗ Trợ

- **Wiki**: [Project Wiki](#)
- **Issues**: [GitHub Issues](#)
- **Email**: contact@example.com
