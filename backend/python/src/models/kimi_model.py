# -*- coding: utf-8 -*-
import json
import logging
from typing import Generator
import httpx
from common.models import StreamChunk
import config.model_mappings as model_mappings
from config.app_settings import ModelConfig, ModelsConfig

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 新增：定义内容类型枚举（方便前后端统一）
class ContentType:
    THINKING = "thinking"  # 思考内容
    CONTENT = "content"    # 最终回答
    ERROR = "error"        # 错误信息

# 兼容方案：封装内容+类型到JSON字符串（无需修改StreamChunk模型）
def wrap_chunk(content: str, finished: bool, type: str):
    """封装内容+类型到JSON字符串，前端解析后分离"""
    return json.dumps({
        "content": content,
        "type": type,
        "finished": finished
    }, ensure_ascii=False)  # 新增：确保中文正常序列化

class KimiModel:
    """Kimi model wrapper using httpx for API requests（区分模型支持/前端开关）"""
    
    def __init__(self, model_id=None):
        import os
        api_key = os.getenv("MOONSHOT_API_KEY")
        if not api_key:
            raise ValueError("MOONSHOT_API_KEY environment variable is required")
        
        self.model_id = model_id or "kimi-k2-turbo"
        self.model_config = ModelsConfig().get_model_by_id(self.model_id)
        # 模型本身是否支持思考模式（后端配置，与前端开关无关）
        self.is_thinking_model = "thinking" in self.model_config.features if self.model_config else False
        
        self.base_url = "https://api.moonshot.cn/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "text/event-stream; charset=utf-8"
        }
        logger.info(
            f"KimiModel初始化完成 | 模型：{self.model_id} | "
            f"模型支持思考模式：{self.is_thinking_model} | API Key：{api_key[:8]}****"
        )
    
    def stream_chat(
        self, 
        messages, 
        temperature=0.3,
        max_tokens=20000, 
        top_p=0.9,
        **kwargs
    ):
        """
        Stream chat completion from Kimi API
        - 核心逻辑：仅当「模型支持思考 + 前端开启思考模式」时，才启用思考相关逻辑
        - 模型不支持思考 → 无论前端是否开启，都返回纯流式回答
        - 模型支持但前端关闭 → 返回纯流式回答
        - 模型支持且前端开启 → 返回思考内容+回答内容
        """
        # 1. 提取前端传递的思考模式开关（默认关闭）
        thinking_mode = kwargs.get("thinkingMode", False)
        # 核心：是否真正启用思考模式（模型支持 + 前端开启）
        should_enable_reasoning = self.is_thinking_model and thinking_mode
        
        logger.info(
            f"发起Kimi流式请求 | 模型：{self.model_id} | "
            f"模型支持思考：{self.is_thinking_model} | 前端开启思考：{thinking_mode} | "
            f"最终启用思考：{should_enable_reasoning}"
        )

        try:
            # 2. 构建标准化消息（兼容Message对象/字典格式）
            api_messages = []
            first_message = messages[0] if messages else None
            has_system = False
            
            # 检查是否已有系统消息
            if first_message:
                if hasattr(first_message, 'sender'):
                    has_system = first_message.sender == 'system'
                else:
                    has_system = first_message.get('sender') == 'system'
            
            # 3. 动态生成系统提示（核心：根据最终是否启用思考模式）
            if should_enable_reasoning:
                # 启用思考模式：包含思考过程指令
                system_content = (
                    "You are Kimi, an AI assistant provided by Moonshot AI. "
                    "同时，你会拒绝回答涉及恐怖主义、种族歧视、色情、暴力的问题。"
                    "Moonshot AI是专有名词，不可翻译为其他语言。"
                )
            else:
                # 禁用思考模式：纯回答，无思考指令（所有模型通用）
                system_content = (
                    "You are Kimi, an AI assistant provided by Moonshot AI. "
                    "你会提供准确、简洁、有用的回答，拒绝回答涉及恐怖主义、种族歧视、色情、暴力的问题。"
                    "Moonshot AI是专有名词，不可翻译为其他语言。"
                )
            
            # 添加系统消息
            if not has_system:
                api_messages.append({"role": "system", "content": system_content})
            else:
                # 追加系统指令（不覆盖原有内容）
                if hasattr(first_message, 'content'):
                    first_message.content += system_content
                else:
                    first_message["content"] += system_content
                api_messages.append(first_message)
            
            # 处理用户/助手消息
            for msg in messages:
                if hasattr(msg, 'sender') and hasattr(msg, 'content'):
                    sender = msg.sender
                    content = msg.content
                else:
                    sender = msg.get('sender', 'user')
                    content = msg.get('content', '')
                
                role = "user" if sender == "user" else "assistant"
                if not content:
                    continue
                api_messages.append({"role": role, "content": content})
            
            # 4. 构建请求体（核心：根据最终是否启用思考模式设置参数）
            payload = {
                "model": self.model_id,
                "messages": api_messages,
                "temperature": temperature,
                "top_p": top_p,
                "max_tokens": max_tokens,
                "stream": True  # 强制流式输出，所有模型都开启
            }
            # 仅当最终启用思考模式时，才添加enable_reasoning参数
            if should_enable_reasoning:
                payload["enable_reasoning"] = True
            # 非思考模式：不添加该参数，避免turbo模型流式异常
            
            logger.debug(f"请求体预览：{json.dumps(payload, ensure_ascii=False)[:200]}...")
            
            # 5. 发起流式请求（延长超时至5分钟，适配thinking模型长思考）
            with httpx.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=300.0,  # 5分钟超时（适配思考模型）
                follow_redirects=True
            ) as response:
                response.raise_for_status()
                logger.info(f"Kimi API响应成功 | 状态码：{response.status_code}")
                
                for line in response.iter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    
                    data_str = line[6:].strip()
                    logger.debug(f"Kimi原始响应：{data_str[:100]}...")
                    
                    if data_str == "[DONE]":
                        logger.info("Kimi流式响应结束")
                        # 发送回答结束标记（所有模型都发送）
                        yield StreamChunk(
                            content=wrap_chunk("", True, ContentType.CONTENT),
                            finished=True
                        )
                        # 仅当最终启用思考模式时，发送思考结束标记
                        if should_enable_reasoning:
                            yield StreamChunk(
                                content=wrap_chunk("", True, ContentType.THINKING),
                                finished=True
                            )
                        break
                    
                    try:
                        data = json.loads(data_str)
                        if "choices" not in data or len(data["choices"]) == 0:
                            continue
                        
                        choice = data["choices"][0]
                        delta = choice.get("delta", {})
                        finish_reason = choice.get("finish_reason")
                        finished = finish_reason is not None
                        
                        # 6. 核心：根据最终是否启用思考模式处理内容
                        # ===== 仅启用思考模式时，解析并返回思考内容 =====
                        if should_enable_reasoning:
                            reasoning_content = delta.get("reasoning_content")
                            if reasoning_content and reasoning_content.strip():
                                yield StreamChunk(
                                    content=wrap_chunk(reasoning_content, finished, ContentType.THINKING),
                                    finished=finished
                                )
                                logger.debug(f"【思考内容】{reasoning_content[:50]}...")
                        
                        # ===== 所有模型：解析并返回最终回答（保证流式正常） =====
                        content = delta.get("content")
                        if content and content.strip():
                            yield StreamChunk(
                                content=wrap_chunk(content, finished, ContentType.CONTENT),
                                finished=finished
                            )
                            logger.debug(f"【回答内容】{content[:50]}...")
                            
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON解析错误：{e} | 原始数据：{data_str[:100]}...")
                        continue
                    except Exception as e:
                        logger.error(f"解析流式数据异常：{e}", exc_info=True)
                        continue
                        
        except httpx.TimeoutException:
            err_msg = f"Kimi API超时（5分钟）| 模型：{self.model_id} | 思考模式：{should_enable_reasoning}"
            logger.error(err_msg)
            yield StreamChunk(
                content=wrap_chunk(err_msg, True, ContentType.ERROR),
                finished=True
            )
        except httpx.HTTPStatusError as e:
            err_msg = f"Kimi API错误 | 状态码：{e.response.status_code} | 详情：{e.response.text[:200]}"
            logger.error(err_msg)
            yield StreamChunk(
                content=wrap_chunk(err_msg, True, ContentType.ERROR),
                finished=True
            )
        except Exception as e:
            err_msg = f"Kimi API未知错误：{str(e)} | 模型：{self.model_id} | 思考模式：{should_enable_reasoning}"
            logger.error(err_msg, exc_info=True)
            yield StreamChunk(
                content=wrap_chunk(err_msg, True, ContentType.ERROR),
                finished=True
            )