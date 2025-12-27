# -*- coding: utf-8 -*-
import json
import logging
import httpx
from common.models import StreamChunk
from config.app_settings import settings

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContentType:
    THINKING = "thinking"
    CONTENT = "content"
    ERROR = "error"

def wrap_chunk(content: str, finished: bool, type: str):
    """封装内容+类型到JSON字符串"""
    return json.dumps({
        "content": content or "",  # 确保不传 None
        "type": type,
        "finished": finished
    }, ensure_ascii=False)

class KimiModel:
    def __init__(self, model_id=None):
        import os
        api_key = os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            raise ValueError("MOONSHOT_API_KEY environment variable is required")
        
        self.model_id = model_id or "kimi-k2-turbo"
        self.model_config = settings.get_model_by_id(self.model_id)
        
        # 安全获取 features
        features = getattr(self.model_config, "features", []) if self.model_config else []
        logger.info(f"KimiModel: Loaded features for model {self.model_id}: {features}")
        self.is_thinking_model = "thinking" in features
        
        self.base_url = "https://api.moonshot.cn/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "text/event-stream"
        }
    
    def stream_chat(self, messages, temperature=0.3, max_tokens=20000, top_p=0.9, **kwargs):
        # 1. 核心判定逻辑
        thinking_mode = kwargs.get("thinkingMode", False)
        should_enable_reasoning = self.is_thinking_model and thinking_mode
        
        logger.info(f"Kimi Req | Model: {self.model_id} | Thinking: {should_enable_reasoning}")

        try:
            # 2. 构建消息与Prompt
            api_messages = []
            
            # 系统提示词处理
            system_text = (
                "You are Kimi, provided by Moonshot AI. "
                "拒绝回答恐怖主义、种族歧视、色情、暴力问题。"
            )
            if should_enable_reasoning:
                system_text += " (Thinking Mode Enabled)" # 可选：根据需要调整提示词

            api_messages.append({"role": "system", "content": system_text})
            
            for msg in messages:
                # 兼容对象属性访问和字典访问
                sender = getattr(msg, 'sender', None) or msg.get('sender', 'user')
                content = getattr(msg, 'content', None) or msg.get('content', '')
                
                if not content: continue
                role = "user" if sender == "user" else "assistant"
                api_messages.append({"role": role, "content": content})
            # 3. 构建请求体
            payload = {
                "model": self.model_id,
                "messages": api_messages,
                "temperature": temperature,
                "top_p": top_p,
                "max_tokens": max_tokens,
                "stream": True
            }
            
            if should_enable_reasoning:
                logger.info("KimiModel: Enabling reasoning feature in payload")
                payload["enable_reasoning"] = True

            # 4. 发起请求
            with httpx.stream("POST", f"{self.base_url}/chat/completions", headers=self.headers, json=payload, timeout=300.0) as response:
                response.raise_for_status()
                
                for line in response.iter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    
                    data_str = line[6:].strip()
                    if data_str == "[DONE]":
                        # 发送结束信号
                        yield StreamChunk(
                            content=wrap_chunk("", True, ContentType.CONTENT),
                            finished=True
                        )
                        break
                    
                    try:
                        data = json.loads(data_str)
                        if not data.get("choices"): continue
                        
                        choice = data["choices"][0]
                        delta = choice.get("delta", {})
                        finish_reason = choice.get("finish_reason")
                        
                        # 判断是否本条消息结束
                        is_finished = finish_reason is not None

                        # A. 处理思考内容 (仅当启用且存在时)
                        if should_enable_reasoning:
                            reasoning = delta.get("reasoning_content")
                            # 关键修复：使用 is not None，防止 strip() 吞掉换行符和空格
                            if reasoning is not None:
                                yield StreamChunk(
                                    content=wrap_chunk(reasoning, False, ContentType.THINKING),
                                    finished=False
                                )

                        # B. 处理正文内容
                        content = delta.get("content")
                        # 关键修复：允许空字符串（有时作为占位符），防止格式丢失
                        if content is not None:
                            yield StreamChunk(
                                content=wrap_chunk(content, is_finished, ContentType.CONTENT),
                                finished=is_finished
                            )
                        elif is_finished:
                            # 如果只有 finish_reason 没有 content，也要发送结束信号
                            yield StreamChunk(
                                content=wrap_chunk("", True, ContentType.CONTENT),
                                finished=True
                            )
                            
                    except Exception as e:
                        logger.error(f"Stream Parse Error: {e}")
                        continue

        except Exception as e:
            err_msg = f"Error: {str(e)}"
            logger.error(err_msg)
            yield StreamChunk(
                content=wrap_chunk(err_msg, True, ContentType.ERROR),
                finished=True
            )