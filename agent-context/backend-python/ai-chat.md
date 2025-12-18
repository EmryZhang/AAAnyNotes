# Python AI Chat Context

## 1. Module Focus
This module provides context for implementing the Python FastAPI service that handles AI chat functionality in the AAAnynotes application. It serves as the AI integration layer, processing chat requests, communicating with external AI services, and managing conversation context. The chat service integrates with the main Go backend through HTTP APIs and provides intelligent responses to user queries.

## 2. File Locations
```
backend/python/
├── src/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API route definitions
│   │   ├── chat.py             # Chat endpoint handlers
│   │   └── health.py           # Health check endpoints
│   ├── models/                 # Pydantic models for request/response
│   │   ├── chat.py             # Chat request/response models
│   │   └── common.py           # Common data models
│   ├── services/               # Business logic layer
│   │   ├── chat_service.py     # Chat processing logic
│   │   ├── ai_client.py        # External AI service client
│   │   └── context_manager.py  # Conversation context management
│   ├── database/               # Database configuration
│   │   └── connection.py       # Database setup
│   └── utils/                  # Utility functions
│       ├── logger.py           # Logging configuration
│       └── config.py           # Configuration management
├── tests/                      # Test files
│   ├── test_chat.py            # Chat functionality tests
│   └── test_models.py          # Model validation tests
└── requirements.txt            # Python dependencies
```

## 3. Feature Implementation
### Currently Implemented Features
- Chat API: FastAPI endpoints for chat interactions
- AI Integration: Connection to external AI services (OpenAI/Anthropic)
- Context Management: Conversation history and context preservation
- Streaming Responses: Real-time streaming chat responses
- Request Validation: Pydantic models for input validation
- Error Handling: Comprehensive error responses and logging
- Health Checks: Service health monitoring endpoints
- Async Processing: Asynchronous request handling for performance

### Key Endpoints
- POST /api/chat: Main chat interaction endpoint
- GET /api/chat/history: Retrieve conversation history
- DELETE /api/chat/context: Clear conversation context
- GET /api/health: Service health check
- GET /api/models: List available AI models

### Core Features
- Multi-turn Conversations: Context-aware chat interactions
- Model Selection: Support for different AI models
- Response Streaming: Real-time response delivery
- Context Persistence: Conversation history storage
- Error Recovery: Graceful handling of AI service failures

## 4. Technical Patterns
### Technologies Used
- Python 3.9+: Core programming language
- FastAPI: Modern async web framework
- Pydantic: Data validation and serialization
- SQLAlchemy: Database ORM (if needed)
- asyncio: Asynchronous programming
- httpx: Async HTTP client for external API calls
- OpenAI/Anthropic SDKs: AI service integration

### Coding Style & Patterns
- Type Hints: Comprehensive type annotations
- Async/Await: Asynchronous programming throughout
- Pydantic Models: Request/response validation
- Dependency Injection: FastAPI dependency system
- Error Handling: Structured exception handling
- Logging: Structured logging with context

### Design Patterns
- Repository Pattern: Data access abstraction
- Service Layer Pattern: Business logic encapsulation
- Factory Pattern: AI client creation
- Observer Pattern: Response streaming
- Strategy Pattern: Different AI model handling
- Circuit Breaker Pattern: External service resilience

### API Design Principles
- RESTful Design: Proper HTTP semantics
- Async First: Non-blocking operations
- Streaming Support: Real-time response delivery
- Error Responses: Consistent error format
- Validation: Comprehensive input validation
- Documentation: Auto-generated OpenAPI docs

### Performance Patterns
- Connection Pooling: Efficient HTTP connections
- Context Caching: Conversation context optimization
- Async Processing: Concurrent request handling
- Memory Management: Efficient context storage
- Timeout Handling: Proper timeout configuration

