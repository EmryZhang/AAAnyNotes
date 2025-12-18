# -*- coding: utf-8 -*-
import os
from pydantic import BaseSettings
from glm_config import GLMConfig


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    glm_api_key: str = ""
    glm_model: str = "glm-4"
    glm_base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def get_glm_config(self) -> GLMConfig:
        """Get GLM configuration from settings"""
        return GLMConfig(
            api_key=self.glm_api_key,
            model=self.glm_model,
            base_url=self.glm_base_url
        )


settings = Settings()
