# -*- coding: utf-8 -*-
"""Model ID mapping configuration - synchronized with config/models.json"""

from typing import Dict, List

# Model ID to model type mapping - based on config/models.json
# Maps specific model IDs (from frontend) to model categories (used by backend)
MODEL_ID_MAPPINGS: Dict[str, str] = {
    # GLM models
    "glm-4": "glm",
    
    # Kimi models
    "kimi-k2-turbo-preview": "kimi",
    "kimi-k2-thinking": "kimi",

    # OpenAI models
    "gpt-4": "openai",
    "gpt-3.5-turbo": "openai",
    
    # Claude models
    "claude-3-sonnet-20240229": "claude",
    "claude-3-opus-20240229": "claude",
    
    # Azure models
    "gpt-4-turbo": "azure",
    
    # Gemini models
    "gemini-pro": "gemini",
    
    # Baidu models
    "ernie-4.0": "baidu",
    
    # Tencent models
    "hunyuan-pro": "tencent",
    
    # Hugging Face models
    "llama-2-70b-chat": "huggingface",
    
    # Cohere models
    "command": "cohere",
    
    # Perplexity models
    "llama-3-70b-instruct": "perplexity",
    
    # Mistral models
    "mistral-large": "mistral",
    
    # Groq models
    "llama-3-70b-8192": "groq",
    
    # Together AI models
    "meta-llama-3-70b-instruct": "together",
}

# Default model ID for each model type (from config/models.json defaultModel)
DEFAULT_MODEL_IDS: Dict[str, str] = {
    "glm": "glm-4",
    "kimi": "kimi-k2-turbo-preview",
    "openai": "gpt-4",
    "claude": "claude-3-sonnet-20240229",
    "azure": "gpt-4-turbo",
    "gemini": "gemini-pro",
    "baidu": "ernie-4.0",
    "tencent": "hunyuan-pro",
    "huggingface": "llama-2-70b-chat",
    "cohere": "command",
    "perplexity": "llama-3-70b-instruct",
    "mistral": "mistral-large",
    "groq": "llama-3-70b-8192",
    "together": "meta-llama-3-70b-instruct",
}

def get_model_type(model_id: str) -> str:
    """Get model type from model ID
    
    Args:
        model_id: Specific model ID from config/models.json
        
    Returns:
        Model type (e.g., 'glm', 'kimi', 'openai', 'claude')
    """
    model_id_lower = model_id.lower().strip()
    
    # Direct lookup first
    if model_id_lower in MODEL_ID_MAPPINGS:
        return MODEL_ID_MAPPINGS[model_id_lower]
    
    # Fallback: try to extract from the model ID itself
    if model_id_lower.startswith("glm-"):
        return "glm"
    elif model_id_lower.startswith("kimi-"):
        return "kimi"
    elif model_id_lower.startswith("gpt-"):
        return "openai"
    elif model_id_lower.startswith("claude-"):
        return "claude"
    elif model_id_lower.startswith("gemini-"):
        return "gemini"
    elif model_id_lower.startswith("ernie-"):
        return "baidu"
    elif model_id_lower.startswith("hunyuan-"):
        return "tencent"
    elif model_id_lower.startswith("llama-"):
        return "huggingface"  # Default to huggingface for llama models
    elif model_id_lower == "command":
        return "cohere"
    elif model_id_lower.startswith("mistral-"):
        return "mistral"
    
    # Last resort: return empty string
    return ""

def get_model_id(model_id: str) -> str:
    """Get normalized model ID for API calls
    
    Args:
        model_id: Input model ID from frontend
        
    Returns:
        Normalized model ID for API calls (original ID if found in mappings)
    """
    model_id_lower = model_id.lower().strip()
    
    # If it's a direct match in mappings, return the original (case-sensitive)
    for known_id in MODEL_ID_MAPPINGS.keys():
        if known_id.lower() == model_id_lower:
            return known_id
            
    # If not found, return the original
    return model_id

def get_available_model_ids() -> List[str]:
    """Get list of all available model IDs from config/models.json"""
    return list(MODEL_ID_MAPPINGS.keys())

def get_enabled_model_ids() -> List[str]:
    """Get list of enabled model IDs (would need to check config/models.json enabled status)"""
    # This would require loading the JSON to check enabled status
    # For now, return all as available
    return get_available_model_ids()

def get_model_features(model_id: str) -> Dict[str, any]:
    """Get model features from model ID

    Args:
        model_id: Specific model ID from config/models.json

    Returns:
        Model features (e.g., 'max_tokens', 'max_prompt_tokens', 'max_completion_tokens')
    """
    # This would require loading the JSON to get model features
    # For now, return empty dict

