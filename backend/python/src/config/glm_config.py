# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import Optional

class GLMConfig(BaseModel):
    """GLM模型配置"""
    api_key: str = ""  # 需要在环境变量中设置
    model: str = "glm-4"  # 默认使用glm-4模型
    base_url: str = "https://open.bigmodel.cn/api/paas/v4/"
