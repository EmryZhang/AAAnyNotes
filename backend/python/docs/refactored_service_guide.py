# -*- coding: utf-8 -*-
"""
Refactored ChatService Documentation
Following agentext principles and working tmp.py approach.

## Key Changes Made

1. **Simplified Message Format**: Following tmp.py working implementation
2. **Direct Model Creation**: Using create_model() function directly
3. **Enhanced Error Handling**: Better logging and fallback mechanisms
4. **Added Testing Methods**: Built-in model testing capabilities

## New Features

### Message Format
Before: Complex message objects with all fields
After: Simple format based on working tmp.py
```python
# Working format (based on tmp.py)
messages = [{
    "sender": "user",
    "content": "message content"
}]
```

### Service Methods

#### stream_chat(req: ChatStreamRequest)
- Converts Message objects to working format
- Uses simplified parameter passing
- Enhanced logging for debugging
- Improved error handling

#### get_available_models()
- Returns dict of available models with configuration status
- Includes error handling for model detection
- Detailed logging for debugging

#### test_model(model_type: str, test_message: str) -> bool
- Built-in model testing capability
- Follows tmp.py test patterns
- Returns boolean success/failure
- Detailed logging for test results

## Usage Examples

### Basic Chat Streaming
```python
from services.chat.chat_service import ChatService
from common.models import ChatStreamRequest, Message

request = ChatStreamRequest(
    messages=[
        Message(
            id="msg-1",
            content="Hello, how are you?",
            sender="user",
            time="2024-01-01T12:00:00Z"
        )
    ],
    model="kimi",
    temperature=0.6,
    maxTokens=2000
)

for chunk in ChatService.stream_chat(request):
    print(chunk.content, end="")
    if chunk.finished:
        break
```

### Model Testing
```python
# Test specific model
success = ChatService.test_model("kimi", "Test message")
print(f"Model test: {'PASSED' if success else 'FAILED'}")

# Check available models
models = ChatService.get_available_models()
print(f"Available models: {models}")
```

### Error Handling
- Graceful fallback when API calls fail
- Detailed error logging for debugging
- Tokenized fallback responses for streaming simulation
- Exception handling with proper traceback logging

## Debugging Features

### Enhanced Logging
- Request processing details
- Model creation information
- Chunk processing status
- Error conditions and resolutions

### Model Status Checking
- API key validation
- Model availability detection
- Configuration status reporting

## File Locations

Based on agentext router.md structure:
- Service: `backend/python/src/services/chat/chat_service.py`
- Models: `backend/python/src/common/models.py`
- Model Factory: `backend/python/src/models/glm_model.py`
- Configuration: `backend/python/src/config/app_settings.py`
- Tests: `backend/python/tests/test_refactored_service.py`

## Testing

### Unit Tests
- Model availability checking
- Streaming functionality
- Error handling mechanisms
- Message format validation

### Integration Tests
- API endpoint testing
- Model factory integration
- Configuration management

## Performance Improvements

1. **Simplified Message Processing**: Reduced overhead in message conversion
2. **Direct Model Access**: Bypassing complex factory patterns
3. **Enhanced Logging**: Reduced performance impact with conditional logging
4. **Error Recovery**: Fast fallback mechanisms

## Compatibility

### Backward Compatible
- Maintains existing API interface
- Supports current frontend request format
- Preserves error response structure

### Frontend Integration
- No changes required in frontend code
- Existing request/response format maintained
- Enhanced debugging information available

## Troubleshooting

### Common Issues
1. **API Key Missing**: Check environment variables
2. **Model Not Found**: Verify model name in factory
3. **Connection Errors**: Check network and API endpoints
4. **Message Format**: Verify Message object structure

### Debug Commands
```python
# Test specific model
ChatService.test_model("kimi")

# Check available models
ChatService.get_available_models()

# Test streaming with debug
request = ChatStreamRequest(...)
for chunk in ChatService.stream_chat(request):
    # Debug chunk processing
```

This refactored service follows the proven tmp.py approach while maintaining compatibility with existing systems.
