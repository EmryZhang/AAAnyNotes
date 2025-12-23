# Python AI Chat Service Documentation

## Module Overview
The Python backend provides AI chat functionality with streaming responses, multiple LLM provider support, and model mapping capabilities.

## Architecture
```
HTTP Request ¡ú FastAPI Router ¡ú Chat Service ¡ú LLM Provider ¡ú Streaming Response
```

## File Structure
```
backend/python/
©À©¤©¤ src/
©¦   ©À©¤©¤ main.py                 # FastAPI application entry point
©¦   ©À©¤©¤ api/
©¦   ©¦   ©¸©¤©¤ endpoints/
©¦   ©¦       ©¸©¤©¤ chat_endpoint.py   # Chat API endpoints
©¦   ©À©¤©¤ services/
©¦   ©¦   ©¸©¤©¤ chat/
©¦   ©¦       ©¸©¤©¤ chat_service.py   # Chat business logic
©¦   ©À©¤©¤ models/
©¦   ©¦   ©À©¤©¤ kimi_model.py         # Kimi model implementation
©¦   ©¦   ©À©¤©¤ glm_model.py          # GLM model implementation
©¦   ©¦   ©¸©¤©¤ ...                 # Other model implementations
©¦   ©À©¤©¤ common/
©¦   ©¦   ©¸©¤©¤ models.py            # Common data models
©¦   ©¸©¤©¤ config/
©¦       ©À©¤©¤ __init__.py          # Configuration classes
©¦       ©À©¤©¤ model_mappings.py    # Model ID to type mapping
©¦       ©¸©¤©¤ app_settings.py      # Application settings
©À©¤©¤ tests/                     # Test files
©¸©¤©¤ requirements.txt             # Python dependencies
```

## Key Components

### API Endpoints (`src/api/endpoints/`)
**Purpose**: HTTP interface for chat functionality
**Files**:
- `chat_endpoint.py`: Chat streaming endpoints with error handling
**Keywords**: endpoint, API, route, FastAPI, HTTP

### Chat Service (`src/services/chat/`)
**Purpose**: Business logic for AI chat processing
**Files**:
- `chat_service.py`: Core chat orchestration and streaming
**Keywords**: service, business logic, AI, streaming, LLM

### Model Implementations (`src/models/`)
**Purpose**: LLM provider integrations
**Files**:
- `kimi_model.py`: Kimi/Moonshot AI integration
- `glm_model.py`: GLM/Zhipu AI integration
- More model implementations...
**Keywords**: model, LLM, provider, integration, streaming

### Configuration (`src/config/`)
**Purpose**: Model management and application settings
**Files**:
- `model_mappings.py`: Model ID to type mapping system
- `__init__.py`: Configuration classes (GLMConfig, KimiConfig, etc.)
- `app_settings.py`: Application-wide settings
**Keywords**: config, environment, model mapping, settings

## Core Features

### Multi-Provider Support
- **Kimi (Moonshot AI)**: kimi-k2-turbo-preview, kimi-k2-thinking
- **GLM (Zhipu AI)**: glm-4, glm-3-turbo
- **OpenAI**: gpt-4, gpt-3.5-turbo
- **Claude**: claude-3-sonnet-20240229, claude-3-opus-20240229
- **And more**: Azure, Gemini, ERNIE, Hunyuan, etc.

### Streaming Architecture
```python
async def stream_chat(request: ChatStreamRequest) -> Generator[StreamChunk, None]:
    model_type = get_model_type(request.model)
    model_id = get_model_id(request.model)
    model = create_model(model_type, model_id)
    
    for chunk in model.stream_chat(
        messages=request.messages,
        temperature=request.temperature,
        maxTokens=request.maxTokens
    ):
        yield chunk
```

### Model Mapping System
```python
# Frontend: "kimi-k2-turbo-preview" ¡ú Backend: type="kimi", id="kimi-k2-turbo-preview"
# Frontend: "glm-4" ¡ú Backend: type="glm", id="glm-4"
# Frontend: "gpt-4" ¡ú Backend: type="openai", id="gpt-4"
```

## Development Guidelines

### Code Style (Following AGENTS.md)
- ALL code comments MUST be in English
- ALL debug output MUST use English text
- ALL log messages MUST be in English
- Variable names: English only (new ones)
- Follow PEP 8 style guidelines
- Use Pydantic models for request/response validation

### Error Handling
```python
try:
    model = create_model(model_type, model_id)
    for chunk in model.stream_chat(messages):
        yield chunk
except Exception as e:
    logger.error(f"Model processing failed: {str(e)}")
    yield StreamChunk(
        content=f"Service error: {str(e)}",
        finished=True
    )
```

### Async Processing
```python
async def send_chat_stream(
    params: ChatStreamParams,
    signal: AbortSignal,
    on_chunk: Callable[[str, bool], None],
    on_error: Callable[[Error], None],
    on_complete: Callable[[], None]
) -> None:
    # Async streaming implementation
```

## Technology Stack
- **Framework**: FastAPI with async support
- **HTTP Streaming**: Server-sent events (SSE)
- **Model Integration**: Factory pattern with configurable providers
- **Configuration**: Environment-based with Pydantic validation
- **Error Handling**: Comprehensive exception management

## Performance Optimizations

### Streaming Implementation
- Efficient text decoding with UTF-8 handling
- Proper SSE (Server-Sent Events) format
- Backpressure handling for large responses
- Memory-efficient chunk processing

### Model Management
- Lazy loading of model implementations
- Connection pooling for HTTP clients
- Timeout management with AbortSignal support
- Graceful degradation for model failures

## Testing Guidelines
- Use pytest for FastAPI endpoint testing
- Mock external LLM providers in unit tests
- Test streaming responses with async generators
- Validate model mapping functionality
- Test error handling and edge cases

## Configuration Management

### Environment Variables
```bash
KIMI_API_KEY=your_moonshot_key
GLM_API_KEY=your_zhipu_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Model Configuration
```json
{
  "models": [
    {
      "id": "kimi-k2-turbo-preview",
      "name": "Kimi K2 Turbo",
      "type": "kimi",
      "envKey": "MOONSHOT_API_KEY",
      "features": ["chat", "streaming", "long-context"]
    },
    {
      "id": "kimi-k2-thinking",
      "name": "Kimi K2 Thinking", 
      "type": "kimi",
      "supportsThinkingMode": true,
      "features": ["chat", "streaming", "long-context", "thinking"]
    }
  ]
}
```

## API Integration

### Streaming Endpoint
```python
@router.post("/stream")
async def chat_stream(request: ChatStreamRequest):
    def generate():
        for chunk in ChatService.stream_chat(request):
            chunk_dict = chunk.dict()
            json_str = json.dumps(chunk_dict, ensure_ascii=False) + "\n"
            yield json_str
    
    return StreamingResponse(generate(), media_type="text/plain")
```

### Model Factory Pattern
```python
def create_model(model_type: str, model_id: str):
    if model_type.lower() == "kimi":
        from .kimi_model import KimiModel
        return KimiModel(model_id=model_id)
    elif model_type.lower() == "glm":
        from .glm_model import GLMModel
        return GLMModel(model_id=model_id)
    else:
        raise ValueError(f"Unsupported model type: {model_type}")
```

---

**This documentation covers the complete Python AI chat service implementation, including streaming architecture, multi-provider support, and best practices.**
