from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from common.models import ChatStreamRequest  # 对应 src/common/models.py
from services.chat.chat_service import ChatService  # 对应 src/services/chat/chat_service.py
import json
from typing import Generator  
import sys

router = APIRouter(prefix="/api/chat")

@router.post("/stream")
async def chat_stream(request: Request, req: ChatStreamRequest):
    print("🐍 收到 Go 服务的请求！")

    def generate() -> Generator[str, None, None]:
        print("🐍 generate 生成器被迭代！")
        try:
            for chunk in ChatService.stream_chat(req):
                json_str = json.dumps(chunk.dict()) + "\n"
                print(f"🐍 发送给 Go：{json_str.strip()}")
                yield json_str
                sys.stdout.flush()
        except Exception as e:
            # 捕获到异常，说明 Go 确实断开了连接
            print(f"🐍 Go 服务已断开连接（捕获异常）：{e}")

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={"X-Accel-Buffering": "no", "Connection": "keep-alive"}
    )