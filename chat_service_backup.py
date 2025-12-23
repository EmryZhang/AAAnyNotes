# -*- coding: utf-8 -*-
from typing import Generator
from common.models import ChatStreamRequest, StreamChunk
from models.glm_model import create_model
import logging

logger = logging.getLogger(__name__)


class ChatService:
    """��ģ�ͶԻ�����֧�ֶ���ģ�͵��ã�GLM��Kimi��OpenAI��Claude��"""
    
    @staticmethod
    def stream_chat(req: ChatStreamRequest) -> Generator[StreamChunk, None, None]:
        try:
            model_type = req.model or "glm-4"
            logger.info(f"ChatService: Creating model '{model_type}'")
            model = create_model(model_type)

            # Convert messages to working format (based on tmp.py)
            converted_messages = []
            for msg in req.messages:
                # Use working format: just sender and content
                converted_messages.append({
                    "sender": msg.sender,
                    "content": msg.content
                })
            
            logger.info(f"ChatService: Processing {len(converted_messages)} messages")
            
            # Use simpler parameter passing (based on tmp.py)
            for chunk in model.stream_chat(
                messages=converted_messages,
                temperature=req.temperature or 0.6,
                maxTokens=req.maxTokens or 2000
            ):
                logger.debug(f"ChatService: Yielding chunk: '{chunk.content[:50]}...' - finished: {chunk.finished}")
                yield chunk
                
        except Exception as e:
            import time
            error_msg = f"ģ�͵���ʧ�ܣ�{str(e)}\n\n"
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

    @staticmethod
    def test_model(model_type: str, test_message: str = "��ã������һ��") -> bool:
        """Test a specific model with a simple message (based on tmp.py approach)"""
        try:
            logger.info(f"ChatService: Testing model '{model_type}'")
            model = create_model(model_type)
            
            # Use working message format
            messages = [{"sender": "user", "content": test_message}]
            
            chunk_count = 0
            for chunk in model.stream_chat(
                messages=messages,
                temperature=0.6,
                maxTokens=100  # Small for testing
            ):
                chunk_count += 1
                logger.debug(f"ChatService: Test chunk {chunk_count}: '{chunk.content[:30]}...' - finished: {chunk.finished}")
                
                if chunk.finished or chunk_count >= 10:  # Reasonable limit for testing
                    break
            
            success = chunk_count > 0
            logger.info(f"ChatService: Model '{model_type}' test {'PASSED' if success else 'FAILED'} - {chunk_count} chunks")
            return success
            
        except Exception as e:
            logger.error(f"ChatService: Model '{model_type}' test FAILED: {str(e)}")
            return False

