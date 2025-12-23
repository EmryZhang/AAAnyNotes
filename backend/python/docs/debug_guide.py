# -*- coding: utf-8 -*-
"""
Backend Debug Guide
Comprehensive debugging procedures for AAAnyNotes Python AI Service.

Following agentext principles and providing systematic debugging approach.
"""

# 1. Enable Debug Mode
# Add to .env file or set environment variable
DEBUG=true
LOG_LEVEL=DEBUG

# 2. Start Service with Debug
# Method 1: Using conda environment (recommended)
cd backend/python
conda activate sj
python src/main.py

# Method 2: Direct path
cd backend/python
D:\Environments\Miniconda\envs\sj\python.exe src/main.py

# 3. Debug Endpoints
# Health Check (shows configuration)
GET http://localhost:8000/health

# Root endpoint (shows available endpoints)
GET http://localhost:8000/

# API Documentation
GET http://localhost:8000/docs

# Chat Service Health
GET http://localhost:8000/api/chat/health

# Available Models
GET http://localhost:8000/api/chat/models

# 4. Debug Chat Streaming
# Test chat streaming endpoint
POST http://localhost:8000/api/chat/stream
Content-Type: application/json

{
  "messages": [
    {
      "id": "msg-1",
      "content": "Hello, how are you?",
      "sender": "user",
      "time": "2024-01-01T12:00:00Z"
    }
  ],
  "model": "kimi",
  "temperature": 0.7,
  "maxTokens": 1000
}

# 5. Debug Information Provided
# When DEBUG=true, the service logs:

## Request Logging:
- HTTP method and URL
- Request headers
- Request body (JSON formatted)
- Client information

## Response Logging:
- Response status code
- Processing time
- Response headers
- Response body (non-streaming)

## Service Logging:
- Model configuration status
- API key presence (masked)
- Stream processing details
- Error tracebacks

# 6. Environment Variables Debug
# Shows all environment variables:
# DEBUG, LOG_LEVEL, DEFAULT_MODEL
# GLM_API_KEY, OPENAI_API_KEY, CLAUDE_API_KEY, MOONSHOT_API_KEY

# 7. Troubleshooting Common Issues

## 404 Errors:
- Check URL path (should be /api/chat/stream)
- Verify FastAPI router registration
- Check prefix configuration

## 500 Errors:
- Look for exception tracebacks in logs
- Check model configuration (API keys)
- Validate request format
- Check service dependencies

## Connection Issues:
- Verify port 8000 is available
- Check firewall settings
- Ensure Python environment has required packages

## Model Issues:
- Check API key format and presence
- Verify model name (kimi, glm-4, etc.)
- Test with different models

# 8. Expected Debug Output Example

```
============================================================
🔍 DEBUG: Incoming Request
  Method: POST
  URL: http://localhost:8000/api/chat/stream
  Headers: {'content-type': 'application/json', ...}
  Client: ('127.0.0.1', 12345)
  Body (JSON): {'messages': [...], 'model': 'kimi', ...}
============================================================

============================================================
🔄 DEBUG: Processing Chat Stream Request
  Request Model: kimi
  Request Temperature: 0.7
  Message Count: 1
  Messages:
    1. ID: msg-1, Sender: user, Content: Hello, how are you?...
============================================================

📤 DEBUG: Chunk 1 - Content: 'Hello! I am...' - Finished: False
📤 DEBUG: Chunk 2 - Content: 'How can I...' - Finished: True
✅ DEBUG: Stream completed after 2 chunks

============================================================
📤 DEBUG: Response
  Status Code: 200
  Process Time: 1.2345s
  Media Type: text/plain
============================================================
```

# 9. Production vs Debug Mode

## Debug Mode (DEBUG=true):
- Full request/response logging
- Environment variables display
- Detailed error tracebacks
- Middleware: DebugMiddleware

## Production Mode (DEBUG=false or not set):
- Basic request logging
- No environment variables display
- Minimal error logging
- Middleware: RequestLoggingMiddleware

# 10. Log Files and Monitoring

## Console Output:
All debug information is logged to console

## Log Levels:
- DEBUG: Detailed debugging information
- INFO: General service information
- WARNING: Non-critical issues
- ERROR: Critical errors

## Monitoring:
Use health endpoints for service status:
- http://localhost:8000/health
- http://localhost:8000/api/chat/health
