# -*- coding: utf-8 -*-
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from common.models import ChatStreamRequest
from services.chat.chat_service import ChatService
from config.app_settings import settings
import json
from typing import Generator
import logging

router = APIRouter(prefix="/chat")
logger = logging.getLogger(__name__)

print(f"DEBUG: Chat router initialized with prefix: /chat")

@router.post("/stream")
async def chat_stream(request: Request, req: ChatStreamRequest):
    """Chat streaming endpoint with detailed debugging"""
    
    print(f"DEBUG: chat_stream endpoint called")
    print(f"DEBUG: Request method: {request.method}")
    print(f"DEBUG: Request URL: {request.url}")
    print(f"DEBUG: Request headers: {dict(request.headers)}")
    print(f"DEBUG: Request client: {request.client}")
    print(f"DEBUG: Request body size: {len(await request.body())} bytes")
    
    # Parse request details
    print(f"DEBUG: Request model: {req.model}")
    print(f"DEBUG: Request messages count: {len(req.messages) if req.messages else 0}")
    
    if req.messages:
        print(f"DEBUG: First message preview: {req.messages[0].content[:50]}...")
        print(f"DEBUG: First message sender: {req.messages[0].sender}")
    
    print(f"DEBUG: Request temperature: {req.temperature}")
    print(f"DEBUG: Request maxTokens: {req.maxTokens}")
    print(f"DEBUG: Request thinkingMode: {getattr(req, 'thinkingMode', False)}")
    
    def generate() -> Generator[str, None, None]:
        try:
            print(f"DEBUG: Starting ChatService.stream_chat()")
            
            chunk_count = 0
            for chunk in ChatService.stream_chat(req):
                chunk_count += 1
                print(f"DEBUG: Chunk {chunk_count} - Content: {chunk.content[:30]}... - Finished: {chunk.finished}")
                
                # Convert chunk to JSON
                if hasattr(chunk, "dict"):
                    chunk_dict = chunk.dict()
                else:
                    chunk_dict = chunk
                
                json_str = json.dumps(chunk_dict, ensure_ascii=False) + "\n"
                yield json_str
                
                if chunk.finished:
                    print(f"DEBUG: Stream completed after {chunk_count} chunks")
                    break
                    
        except Exception as e:
            print(f"ERROR: ChatService.stream_chat() failed: {str(e)}")
            import traceback
            print(f"ERROR: Traceback: {traceback.format_exc()}")
            
            error_chunk = {
                "content": f"Service error: {str(e)}",
                "finished": True
            }
            error_json = json.dumps(error_chunk, ensure_ascii=False) + "\n"
            print(f"DEBUG: Error Response: {error_json}")
            yield error_json

    try:
        print(f"DEBUG: Creating StreamingResponse")
        response = StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={"X-Accel-Buffering": "no", "Connection": "keep-alive"}
        )
        print(f"DEBUG: StreamingResponse created successfully")
        return response
        
    except Exception as e:
        print(f"ERROR: StreamingResponse creation failed: {str(e)}")
        import traceback
        print(f"ERROR: Traceback: {traceback.format_exc()}")
        raise

@router.get("/health")
async def chat_health():
    """Chat service health check"""
    print(f"DEBUG: Chat health endpoint called")
    try:
        available_models = ChatService.get_available_models()
        print(f"DEBUG: Available models: {available_models}")
        
        return {
            "status": "healthy",
            "service": "Chat Service",
            "available_models": available_models
        }
        
    except Exception as e:
        print(f"ERROR: Chat health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "Chat Service",
            "error": str(e)
        }

@router.get("/models")
async def get_models():
    """Get available AI models with full configuration"""
    print(f"DEBUG: Models endpoint called")
    try:
        models_config = settings.get_enabled_models()
        print(f"DEBUG: Available models with config: {models_config}")
        
        return {
            "models": models_config.get("models", []),
            "defaultModel": models_config.get("defaultModel", "glm-4")
        }
        
    except Exception as e:
        print(f"ERROR: Models listing failed: {str(e)}")
        import traceback
        print(f"ERROR: Traceback: {traceback.format_exc()}")
        return {
            "models": [],
            "defaultModel": "glm-4",
            "error": str(e)
        }

print(f"DEBUG: All chat routes registered:")
for route in router.routes:
    print(f"  {route.path} - {route.methods}")








