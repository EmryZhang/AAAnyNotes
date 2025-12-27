# -*- coding: utf-8 -*-
from typing import Generator
from common.models import ChatStreamRequest, StreamChunk, Message
from models.glm_model import create_model
from config.model_mappings import get_model_type, get_model_id
import logging

logger = logging.getLogger(__name__)


class ChatService:
    """AI model chat service supporting multiple models (GLM, Kimi, OpenAI, Claude)"""
    
    @staticmethod
    def stream_chat(req: ChatStreamRequest) -> Generator[StreamChunk, None, None]:
        print(f"DEBUG: ChatService.stream_chat() called with model: {req.model}")
        try:
            model_type = get_model_type(req.model) if req.model else "kimi"
            model_id = get_model_id(req.model) if req.model else None
            model = create_model(model_type, model_id)

            # Convert messages to working format (based on tmp.py)
            converted_messages = []
            for msg in req.messages:
                # Handle both Message objects and dictionaries (more robust check)
                if hasattr(msg, "sender") and hasattr(msg, "content") and hasattr(msg, "id") and hasattr(msg, "time"):
                    sender = msg.sender
                    content = msg.content
                else:
                    # Assume dictionary format
                    sender = msg.get('sender', 'user')
                    content = msg.get('content', '')
                
                converted_messages.append({
                    "sender": sender,
                    "content": content
                })
            
            
            # Use simpler parameter passing
            for chunk in model.stream_chat(
                messages=converted_messages,
                temperature=req.temperature or 0.6,
                maxTokens=req.maxTokens or 2000,
                thinkingMode=getattr(req, "thinkingMode", False),
            ):
                yield chunk
                
        except Exception as e:
            import time
            error_msg = f"Model call failed: {str(e)}\n\n"
            logger.error(f"ChatService: Error occurred: {str(e)}")
            
            # Fallback response (split into tokens for streaming simulation)
            tokens = error_msg.split(" ")
            tokens = [token + " " for token in tokens]
            if tokens:
                tokens[-1] = tokens[-1].strip()
            
            for i, token in enumerate(tokens):
                time.sleep(0.5)
                chunk = StreamChunk(content=token, finished=(i == len(tokens) - 1))
                yield chunk

    @staticmethod
    def get_available_models():
        """Get list of available models with their configuration status"""
        try:
            from config.app_settings import settings
            available_models = settings.get_available_models()
            logger.info(f"ChatService: Available models: {available_models}")
            return available_models
        except Exception as e:
            logger.error(f"ChatService: Error getting available models: {str(e)}")
            return {}
