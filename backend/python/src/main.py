from fastapi import FastAPI
from api.endpoints.chat_endpoint import router as chat_router

# 初始化 FastAPI 应用
app = FastAPI(title="大模型推理服务")

# 注册路由
app.include_router(chat_router)

if __name__ == "__main__":
    import uvicorn
    # 启动服务（监听 8000 端口，允许跨域）
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True  # 开发环境启用自动重载
    )