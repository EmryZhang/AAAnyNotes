# -*- coding: utf-8 -*-
import os
from fastapi import FastAPI
from api.endpoints.chat_endpoint import router as chat_router
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="AI Model Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)

@app.on_event("startup")
async def startup_event():
    """Validate configuration on startup"""
    if not settings.glm_api_key:
        print("??  Warning: GLM_API_KEY not configured. Set it in .env file.")
    else:
        print(f"? GLM model configured: {settings.glm_model}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
