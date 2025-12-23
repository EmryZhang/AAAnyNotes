# -*- coding: utf-8 -*-
import asyncio
from typing import Generator, AsyncGenerator
import httpx
from config import GLMConfig, KimiConfig, get_model_config
from common.models import StreamChunk


class GLMModel:
    """GLM model wrapper for streaming chat completion"""
    
    def __init__(self, config: GLMConfig = None, model_id=None):
        self.config = config or get_model_config("glm")
        self.model_id = model_id or "glm-4"
        
        if not self.config.get_api_key():
            raise ValueError("GLM_API_KEY environment variable is required")
            
        self.base_url = self.config.get_base_url()
        self.headers = {
            "Authorization": f"Bearer {self.config.get_api_key()}",
            "Content-Type": "application/json"
        }
        
    def stream_chat(self, messages, temperature=0.7, max_tokens=2000, **kwargs):
        """Stream chat completion from GLM API
        
        Args:
            messages: List of message dictionaries with 'sender' and 'content'
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional parameters
            
        Yields:
            StreamChunk objects
        """
        # Convert to GLM API format - handle both Message objects and dictionaries
        api_messages = []
        for msg in messages:
            # Handle both Message objects and dictionaries
            if hasattr(msg, 'sender') and hasattr(msg, 'content'):
                # Message object
                sender = msg.sender
                content = msg.content
            else:
                # Dictionary format
                sender = msg.get("sender", "user")
                content = msg.get("content", "")
                
            role = "user" if sender == "user" else "assistant"
            api_messages.append({
                "role": role,
                "content": content
            })
        
        payload = {
            "model": self.model_id,
            "messages": api_messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }
        
        try:
            with httpx.stream(
                "POST",
                f"{self.base_url}chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60.0
            ) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]  # Remove "data: " prefix
                        if data_str.strip() == "[DONE]":
                            break
                            
                        try:
                            import json
                            data = json.loads(data_str)
                            
                            if "choices" in data and len(data["choices"]) > 0:
                                choice = data["choices"][0]
                                if "delta" in choice and "content" in choice["delta"]:
                                    content = choice["delta"]["content"]
                                    finished = choice.get("finish_reason") is not None
                                    
                                    yield StreamChunk(
                                        content=content,
                                        finished=finished
                                    )
                        except json.JSONDecodeError:
                            continue
                            
        except Exception as e:
            yield StreamChunk(
                content=f"GLM API error: {str(e)}",
                finished=True
            )


def create_model(model_type: str, model_id=None):
    """Factory function to create model instances"""
    if model_type.lower() == "glm":
        return GLMModel(model_id=model_id)
    elif model_type.lower() == "kimi":
        # Import KimiModel only when needed to avoid dependency issues
        try:
            from .kimi_model import KimiModel
            return KimiModel(model_id=model_id)
        except ImportError:
            raise ValueError("Kimi model requires openai package to be installed")
    else:
        raise ValueError(f"Unsupported model type: {model_type}")

