# -*- coding: utf-8 -*-
"""Configuration module for AI model providers"""

import os
from typing import Optional
from pydantic import BaseModel


class GLMConfig(BaseModel):
    """GLM (Zhipu AI) model configuration"""
    
    def __init__(self, **data):
        super().__init__(**data)
        self._api_key = os.getenv("GLM_API_KEY", "")
        self._base_url = os.getenv("GLM_BASE_URL", "https://open.bigmodel.cn/api/paas/v4/")
        
    def get_api_key(self) -> str:
        """Get GLM API key from environment"""
        return self._api_key
        
    def get_base_url(self) -> str:
        """Get GLM base URL"""
        return self._base_url
        
    def is_configured(self) -> bool:
        """Check if GLM is properly configured"""
        return bool(self._api_key)


class OpenAIConfig(BaseModel):
    """OpenAI model configuration"""
    
    def __init__(self, **data):
        super().__init__(**data)
        self._api_key = os.getenv("OPENAI_API_KEY", "")
        self._base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1/")
        self._organization = os.getenv("OPENAI_ORGANIZATION", "")
        
    def get_api_key(self) -> str:
        """Get OpenAI API key from environment"""
        return self._api_key
        
    def get_base_url(self) -> str:
        """Get OpenAI base URL"""
        return self._base_url
        
    def get_organization(self) -> str:
        """Get OpenAI organization ID"""
        return self._organization
        
    def is_configured(self) -> bool:
        """Check if OpenAI is properly configured"""
        return bool(self._api_key)


class ClaudeConfig(BaseModel):
    """Claude (Anthropic) model configuration"""
    
    def __init__(self, **data):
        super().__init__(**data)
        self._api_key = os.getenv("CLAUDE_API_KEY", "")
        self._base_url = os.getenv("CLAUDE_BASE_URL", "https://api.anthropic.com")
        
    def get_api_key(self) -> str:
        """Get Claude API key from environment"""
        return self._api_key
        
    def get_base_url(self) -> str:
        """Get Claude base URL"""
        return self._base_url
        
    def is_configured(self) -> bool:
        """Check if Claude is properly configured"""
        return bool(self._api_key)


class KimiConfig(BaseModel):
    """Kimi (Moonshot AI) model configuration"""
    
    def __init__(self, **data):
        super().__init__(**data)
        self._api_key = os.getenv("MOONSHOT_API_KEY", "")
        self._base_url = os.getenv("KIMI_BASE_URL", "https://api.moonshot.cn/v1")
        
    def get_api_key(self) -> str:
        """Get Kimi API key from environment"""
        return self._api_key
        
    def get_base_url(self) -> str:
        """Get Kimi base URL"""
        return self._base_url
        
    def is_configured(self) -> bool:
        """Check if Kimi is properly configured"""
        return bool(self._api_key)


def get_model_config(model_type: str):
    """Get model configuration by type
    
    Args:
        model_type: Model type ('glm', 'openai', 'claude', 'kimi')
        
    Returns:
        Model configuration instance
        
    Raises:
        ValueError: If model type is not supported
    """
    model_configs = {
        "glm": GLMConfig(),
        "openai": OpenAIConfig(),
        "claude": ClaudeConfig(),
        "kimi": KimiConfig(),
    }
    
    config = model_configs.get(model_type.lower())
    if not config:
        raise ValueError(f"Unsupported model type: {model_type}")
    
    return config


# Export all configurations
__all__ = [
    'GLMConfig',
    'OpenAIConfig', 
    'ClaudeConfig',
    'KimiConfig',
    'get_model_config'
]
