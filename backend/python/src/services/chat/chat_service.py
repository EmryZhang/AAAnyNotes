# -*- coding: utf-8 -*-
from typing import Generator
from common.models import ChatStreamRequest, StreamChunk
from models.glm_model import create_model


class ChatService:
    """大模型对话服务，支持多种模型调用"""
    
    @staticmethod
    def stream_chat(req: ChatStreamRequest) -> Generator[StreamChunk, None, None]:
        try:
            model_type = req.model or "glm-4"
            model = create_model(model_type)
            
            params = {
                "temperature": req.temperature,
                "topP": req.topP,
                "maxTokens": req.maxTokens,
                "frequencyPenalty": req.frequencyPenalty,
                "presencePenalty": req.presencePenalty,
                "stop": req.stop
            }
            
            for chunk in model.stream_chat(req.messages, **params):
                yield chunk
                
        except Exception as e:
            import time
            response_text = f"模型调用失败，使用模拟回复：{str(e)}\n\n请检查配置和网络连接。"
            tokens = response_text.split(" ")
            tokens = [token + " " for token in tokens]
            tokens[-1] = tokens[-1].strip()
            
            for i, token in enumerate(tokens):
                time.sleep(0.5)
                chunk = StreamChunk(content=token, finished=(i == len(tokens) - 1))
                yield chunk
