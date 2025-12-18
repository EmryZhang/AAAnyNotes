# -*- coding: utf-8 -*-
import os
import json
import asyncio
from typing import Generator, AsyncGenerator
import httpx
from config.glm_config import GLMConfig
from config.settings import settings
from common.models import StreamChunk


class GLMModel:
    """GLM model wrapper for streaming chat completion"""
    
    def __init__(self, config: GLMConfig = None):
        self.config = config or settings.get_glm_config()
        
        if not self.config.api_key:
            raise ValueError("GLM_API_KEY environment variable is required")
    
    def stream_chat(self, messages: list, **kwargs) -> Generator[StreamChunk, None, None]:
        glm_messages = []
        for msg in messages:
            glm_messages.append({
                "role": "user" if msg.sender == "user" else "assistant",
                "content": msg.content
            })
        
        payload = {
            "model": self.config.model,
            "messages": glm_messages,
            "stream": True,
            "temperature": kwargs.get("temperature", 0.7),
            "top_p": kwargs.get("topP", 0.9),
            "max_tokens": kwargs.get("maxTokens", 2000),
            "frequency_penalty": kwargs.get("frequencyPenalty", 0.0),
            "presence_penalty": kwargs.get("presencePenalty", 0.0),
        }
        
        if kwargs.get("stop"):
            payload["stop"] = kwargs["stop"]
        
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            with httpx.Client(timeout=60.0) as client:
                with client.stream(
                    "POST",
                    f"{self.config.base_url}chat/completions",
                    headers=headers,
                    json=payload
                ) as response:
                    response.raise_for_status()
                    
                    for line in response.iter_lines():
                        if line.strip():
                            if line.startswith("data: "):
                                line = line[6:]
                            
                            if line.strip() == "[DONE]":
                                break
                            
                            try:
                                data = json.loads(line)
                                if "choices" in data and len(data["choices"]) > 0:
                                    delta = data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        content = delta["content"]
                                        finish_reason = data["choices"][0].get("finish_reason")
                                        finished = finish_reason is not None
                                        yield StreamChunk(content=content, finished=finished)
                            except json.JSONDecodeError:
                                continue
                        
        except httpx.HTTPError as e:
            error_msg = f"GLM API error: {str(e)}"
            yield StreamChunk(content=error_msg, finished=True)
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            yield StreamChunk(content=error_msg, finished=True)


class BaseModel:
    """Base model interface for future extensibility"""
    
    def stream_chat(self, messages: list, **kwargs) -> Generator[StreamChunk, None, None]:
        raise NotImplementedError("Subclasses must implement stream_chat method")


def create_model(model_type: str, **kwargs) -> BaseModel:
    if model_type.lower() == "glm" or model_type.lower().startswith("glm-"):
        return GLMModel()
    else:
        return GLMModel()
