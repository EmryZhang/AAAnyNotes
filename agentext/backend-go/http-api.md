# Go Backend HTTP API Documentation

## Module Overview
The Go backend serves as the API gateway and HTTP interface for the AAAnyNotes application. It handles REST API endpoints, authentication, and database operations.

## Architecture
```
HTTP Request ¡ú Gin Router ¡ú HTTP Handler ¡ú Service Layer ¡ú Repository/Database
```

## File Structure
```
backend/go/
©À©¤©¤ cmd/
©¦   ©¸©¤©¤ api/
©¦       ©¸©¤©¤ main.go              # Application entry point
©À©¤©¤ internal/
©¦   ©À©¤©¤ config/                 # Configuration management
©¦   ©¦   ©¸©¤©¤ config.go
©¦   ©À©¤©¤ domain/                  # Domain models and business logic
©¦   ©¦   ©À©¤©¤ card/              # Card domain models
©¦   ©¦   ©À©¤©¤ chat/              # Chat domain models
©¦   ©¦   ©¦   ©À©¤©¤ model/         # Chat domain models
©¦   ©¦   ©¦   ©¸©¤©¤ service/     # Chat services
©¦   ©¦   ©¸©¤©¤ share/            # Shared domain models
©¦   ©À©¤©¤ infrastructure/         # Infrastructure layer
©¦   ©¦   ©À©¤©¤ grpc/             # gRPC communication
©¦   ©¦   ©¸©¤©¤ storage/          # Database storage
©¦   ©¸©¤©¤ interface/
©¦       ©¸©¤©¤ http/              # HTTP interface layer
©¦           ©À©¤©¤ routes.go        # Route definitions
©¦           ©¸©¤©¤ handlers/         # HTTP handlers
©¸©¤©¤ pkg/                        # Public packages
```

## Key Components

### HTTP Interface Layer (`internal/interface/http/`)
**Purpose**: Define HTTP API contracts and routing

**Files**:
- `routes.go`: API route definitions and middleware setup
- `handlers/`: HTTP request handlers for different endpoints

**Keywords**: route, handler, endpoint, HTTP request, middleware

### Domain Layer (`internal/domain/`)
**Purpose**: Business logic and domain models

**Files**:
- `card/`: Card domain models and business rules
- `chat/`: Chat domain models and services
- `share/`: Shared domain models

**Keywords**: domain, model, business logic, validation

### Infrastructure Layer (`internal/infrastructure/`)
**Purpose**: External service integrations and data persistence

**Files**:
- `grpc/`: gRPC client for Python AI service communication
- `storage/`: Database operations and GORM models

**Keywords**: database, GORM, repository, external service


## API Endpoints

### Card Management
- `GET /api/cards` - List all cards
- `POST /api/cards` - Create new card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Chat/Communication
- `POST /api/chat/send` - Send chat message
- `GET /api/chat/history/{userId}` - Get chat history
- `POST /api/chat/stream` - Stream chat response

## Technology Stack
- **Framework**: Gin HTTP framework
- **Database**: GORM ORM
- **Communication**: gRPC with Python backend
- **Authentication**: JWT tokens
- **Configuration**: Environment-based config management

## Development Guidelines

### Code Style (Following AGENTS.md)
- Use standard Go formatting (`go fmt`)
- camelCase for variables, PascalCase for exported types/functions
- ALL code comments MUST be in English
- ALL error messages MUST be in English
- ALL log messages MUST be in English

### Error Handling
```go
func (h *ChatHandler) HandleChat(c *gin.Context) {
    try {
        // Business logic
    } catch (err error) {
        logger.Error("Failed to process chat request", "error", err)
        c.JSON(500, gin.H{"error": "Internal server error"})
        return
    }
}
```

### Request/Response Patterns
```go
// Request DTO
type CreateCardRequest struct {
    Title   string `json:"title" binding:"required"`
    Content string `json:"content"`
    Tags    []string `json:"tags"`
}

// Response DTO
type APIResponse struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data,omitempty"`
    Error   string      `json:"error,omitempty"`
}
```

### Database Operations
```go
// Repository pattern
type CardRepository interface {
    Create(card *domain.Card) error
    GetByID(id string) (*domain.Card, error)
    GetAll() ([]*domain.Card, error)
    Update(card *domain.Card) error
    Delete(id string) error
}
```

## Testing Guidelines
- Use standard `testing` package with `_test.go` suffix
- Mock external dependencies (database, gRPC client)
- Write table-driven tests for business logic
- Test HTTP handlers using httptest package

## Performance Considerations
- Implement connection pooling for database
- Use gRPC streaming for large responses
- Add appropriate caching layers
- Implement request timeouts and rate limiting
