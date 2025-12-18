# -*- coding: utf-8 -*-
from pydantic import BaseModel
from typing import List, Optional


class Message(BaseModel):
    """单条消息模型（与前端/Go 对齐）"""
    id: str
    content: str
    sender: str  # "user" 或 "ai"
    time: str


class ChatStreamRequest(BaseModel):
    """大模型流式请求参数（与 Go 对齐）"""
    messages: List[Message]
    model: Optional[str] = "gpt-3.5-turbo"
    temperature: Optional[float] = 0.7
    topP: Optional[float] = 0.9
    maxTokens: Optional[int] = 2000
    frequencyPenalty: Optional[float] = 0.0
    presencePenalty: Optional[float] = 0.0
    stop: Optional[List[str]] = None


class StreamChunk(BaseModel):
    """流式响应数据块（与前端/Go 对齐）"""
    content: str
    finished: bool
