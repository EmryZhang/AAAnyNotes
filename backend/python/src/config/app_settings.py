# -*- coding: utf-8 -*-
import os
import json
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv


# Load environment variables from shared .env file
load_dotenv(dotenv_path="../../../config/.env")


class ModelConfig:
    """Represents a single model configuration from models.json"""
    
    def __init__(self, data: Dict[str, Any]):
        self.id = data.get("id", "")
        self.name = data.get("name", "")
        self.provider = data.get("provider", "")
        self.description = data.get("description", "")
        self.type = data.get("type", "")
        self.env_key = data.get("envKey", "")
        self.enabled = data.get("enabled", False)
        self.max_tokens = data.get("maxTokens", 4096)
        self.temperature = data.get("temperature", {"min": 0.0, "max": 2.0, "default": 0.7})
        self.features = data.get("features", [])

    def get_features_by_id(self, model_id: str) -> Optional[List[str]]:
        """Get specific feature by ID"""
        return [feature for feature in self.features if feature.get("id") == model_id]

class ModelsConfig:
    """Represents the complete models.json configuration"""
    
    def __init__(self, data: Dict[str, Any]):
        self.models = [ModelConfig(model_data) for model_data in data.get("models", [])]
        self.default_model = data.get("defaultModel", "")
        self.model_types = data.get("modelTypes", {})
        self.categories = data.get("categories", {})
    
    @staticmethod
    def get_modelconfig_by_id(self, model_id: str) -> Optional[ModelConfig]:
        """Get ModelConfig by model ID"""
        for model in self.models:
            if model.id == model_id:
                return model
        return None
    
    def get_features_by_model_id(self, model_id: str) -> Optional[List[str]]:
        """Get features list for a specific model by ID"""
        for model in self.models:
            if model.id == model_id:
                return model.get_features_by_id(model_id)
        return None
    
    def get_enabled_models(self) -> List[ModelConfig]:
        """Get enabled models that have API keys configured"""
        enabled = []
        settings = AppSettings()
        
        for model in self.models:
            if model.enabled and settings.has_api_key_for_env(model.env_key):
                enabled.append(model)
        
        return enabled
    
    def get_model_by_id(self, model_id: str) -> Optional[ModelConfig]:
        """Get model configuration by ID"""
        for model in self.models:
            if model.id == model_id:
                return model
        return None
    
    def get_models_by_type(self, model_type: str) -> List[ModelConfig]:
        """Get models by type"""
        return [model for model in self.models if model.type == model_type]
    
    def get_models_by_category(self, category: str) -> List[ModelConfig]:
        """Get models by category"""
        models = []
        for model in self.models:
            type_info = self.model_types.get(model.type, {})
            if type_info.get("category") == category:
                models.append(model)
        return models


class AppSettings:
    """Application settings configuration"""
    
    def __init__(self, **data):
        # Load environment-based settings
        self.debug = data.get('debug', os.getenv("DEBUG", "false").lower() == "true")
        self.log_level = data.get('log_level', os.getenv("LOG_LEVEL", "INFO"))
        self.default_model = data.get('default_model', os.getenv("DEFAULT_MODEL", "glm"))
        
        # Service settings
        self.port_go = os.getenv("PORT_GO", "8080")
        self.port_python = os.getenv("PORT_PYTHON", "8000")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        
        # Database settings
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = os.getenv("DB_PORT", "5432")
        self.db_name = os.getenv("DB_NAME", "aanynotes")
        self.db_user = os.getenv("DB_USER", "")
        self.db_password = os.getenv("DB_PASSWORD", "")
        
        # Security settings
        self.jwt_secret = os.getenv("JWT_SECRET", "")
        self.encryption_key = os.getenv("ENCRYPTION_KEY", "")
        
        # External service URLs
        self.python_api_url = os.getenv("PYTHON_API_URL", "http://localhost:8000")
        self.go_api_url = os.getenv("GO_API_URL", "http://localhost:8080")
        
        # Load models configuration
        self.models_config = self._load_models_config()
    
    def _load_models_config(self) -> Optional[ModelsConfig]:
        """Load models configuration from models.json file"""
        try:
            models_config_path = os.path.join(
                os.path.dirname(__file__), 
                "../../../../config/models.json"
            )
            with open(models_config_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return ModelsConfig(data)
        except FileNotFoundError:
            print(f"Warning: models.json not found at {models_config_path}, using default config")
            return self._create_default_models_config()
        except json.JSONDecodeError as e:
            print(f"Error parsing models.json: {e}, using default config")
            return self._create_default_models_config()
        except Exception as e:
            print(f"Error loading models.json: {e}, using default config")
            return self._create_default_models_config()
    
    def _create_default_models_config(self) -> ModelsConfig:
        """Create a default models configuration"""
        default_data = {
            "models": [
                {
                    "id": "glm-4",
                    "name": "GLM-4",
                    "provider": "Zhipu AI",
                    "description": "Zhipu AI large model, supports Chinese and English dialogue",
                    "type": "glm",
                    "envKey": "GLM_API_KEY",
                    "enabled": True,
                    "maxTokens": 8192,
                    "temperature": {"min": 0.0, "max": 2.0, "default": 0.7},
                    "features": ["chat", "streaming", "multilingual"]
                }
            ],
            "defaultModel": "glm-4",
            "modelTypes": {
                "glm": {
                    "category": "chinese-models",
                    "region": "china",
                    "languageSupport": ["zh", "en"]
                }
            },
            "categories": {
                "chinese-models": {
                    "name": "Chinese Models",
                    "description": "Models optimized for Chinese language and context"
                }
            }
        }
        return ModelsConfig(default_data)
    
    def get_available_models(self) -> Dict[str, bool]:
        """Get all available models and their API key status from environment variables"""
        available = {}
        
        # Get all API keys from environment
        api_keys = self.get_all_api_keys()
        
        # Check each model in the configuration
        for model in self.models_config.models:
            if model.enabled and self.has_api_key_for_env(model.env_key):
                available[model.type] = True
        
        # Also include any API keys that are not in models.json
        for model_type in api_keys:
            if model_type not in available:
                available[model_type] = True
        
        return available
    
    def get_enabled_models(self) -> Dict[str, Any]:
        """Get enabled models with API key availability"""
        enabled_models = []
        available_models = self.get_available_models()
        
        for model in self.models_config.models:
            if model.enabled:
                # Check if in debug mode or has API key
                include_model = self.debug or self.has_api_key_for_env(model.env_key)
                if include_model:
                    enabled_models.append({
                        "id": model.id,
                        "name": model.name,
                        "provider": model.provider,
                        "description": model.description,
                        "type": model.type,
                        "maxTokens": model.max_tokens,
                        "temperature": model.temperature,
                        "features": model.features,
                        "envKey": model.env_key,
                        "hasApiKey": self.has_api_key_for_env(model.env_key)
                    })
        
        return {
            "models": enabled_models,
            "defaultModel": self.default_model or self.models_config.default_model
        }
    
    def get_model_config(self, model_type: str):
        """Get model configuration by type"""
        for model in self.models_config.models:
            if model.type == model_type:
                return model
        return None
    
    def has_api_key_for_env(self, env_key: str) -> bool:
        """Check if an API key exists for the given environment variable"""
        return bool(os.getenv(env_key) and os.getenv(env_key).strip())
    
    def get_api_key(self, model: str) -> str:
        """Get API key for a specific model type"""
        # First try to find the model in models.json
        model_config = self.get_model_config(model)
        if model_config:
            return os.getenv(model_config.env_key) or ""
        
        # Fallback to environment variable pattern
        env_key = f"{model.upper()}_API_KEY"
        return os.getenv(env_key) or ""
    
    def has_api_key(self, model: str) -> bool:
        """Check if a model has an API key configured"""
        return bool(self.get_api_key(model) and self.get_api_key(model).strip())
    
    def get_all_api_keys(self) -> Dict[str, str]:
        """Get all configured API keys from environment"""
        api_keys = {}
        for env_key, env_value in os.environ.items():
            if env_key.endswith('_API_KEY') and env_value.strip():
                # Convert GLM_API_KEY to glm for storage
                model_key = env_key.lower().replace('_api_key', '')
                api_keys[model_key] = env_value
        return api_keys
    
    def get_available_model_names(self) -> List[str]:
        """Get a list of all model types that have API keys"""
        return list(self.get_available_models().keys())
    
    def get_models_by_category(self, category: str) -> List[ModelConfig]:
        """Get models by category"""
        return self.models_config.get_models_by_category(category)
    
    def get_models_by_type(self, model_type: str) -> List[ModelConfig]:
        """Get models by type"""
        return self.models_config.get_models_by_type(model_type)
    
    def get_model_by_id(self, model_id: str) -> Optional[ModelConfig]:
        """Get model by ID"""
        return self.models_config.get_model_by_id(model_id)
    
    def reload_configuration(self) -> bool:
        """Reload configuration from files"""
        try:
            # Reload environment variables
            load_dotenv(dotenv_path="../../../config/.env", override=True)
            
            # Reload models configuration
            self.models_config = self._load_models_config()
            
            # Update settings
            self.debug = os.getenv("DEBUG", "false").lower() == "true"
            self.log_level = os.getenv("LOG_LEVEL", "INFO")
            self.default_model = os.getenv("DEFAULT_MODEL", "glm")
            
            return True
        except Exception as e:
            print(f"Error reloading configuration: {e}")
            return False
    
    def get_config_summary(self) -> Dict[str, Any]:
        """Get a summary of current configuration"""
        return {
            "debug_mode": self.debug,
            "log_level": self.log_level,
            "default_model": self.default_model,
            "api_keys_count": len(self.get_all_api_keys()),
            "available_models": self.get_available_model_names(),
            "enabled_models": len(self.models_config.get_enabled_models()),
            "total_models": len(self.models_config.models),
            "port_go": self.port_go,
            "port_python": self.port_python,
            "frontend_url": self.frontend_url,
            "models_config_loaded": self.models_config is not None
        }


# Global settings instance
settings = AppSettings(debug=True)  # Enable debug mode for development
