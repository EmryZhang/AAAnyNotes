# -*- coding: utf-8 -*-
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from common.models import ChatStreamRequest
from services.chat.chat_service import ChatService
import json
from typing import Generator

router = APIRouter(prefix="/api/chat")

@router.post("/stream")
async def chat_stream(request: Request, req: ChatStreamRequest):
    def generate() -> Generator[str, None, None]:
        try:
            for chunk in ChatService.stream_chat(req):
                if hasattr(chunk, "dict"):
                    chunk_dict = chunk.dict()
                else:
                    chunk_dict = chunk
                
                json_str = json.dumps(chunk_dict, ensure_ascii=False) + "\n"
                yield json_str
        except Exception as e:
            error_chunk = {
                "content": f"服务错误：{str(e)}",
                "finished": True
            }
            yield json.dumps(error_chunk, ensure_ascii=False) + "\n"

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={"X-Accel-Buffering": "no", "Connection": "keep-alive"}
    )
