# -*- coding: utf-8 -*-
"""
AAAnyNotes Python AI Service
FastAPI service providing AI model integration for chat functionality.

This service handles:
- AI model integration (GLM, OpenAI, Claude, Kimi)
- Streaming chat responses
- Multi-model configuration management
- API key validation and security
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints.chat_endpoint import router as chat_router
from config.app_settings import settings

# Load environment variables from shared .env file
from dotenv import load_dotenv
load_dotenv(dotenv_path="../../config/.env")

# Configure logging to show all debug messages
logging.basicConfig(
    level=logging.DEBUG,  # Force DEBUG level for troubleshooting
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
    ]
)
logger = logging.getLogger(__name__)

# FastAPI application
app = FastAPI(
    title="AAAnyNotes AI Service",
    description="AI model integration service for AAAnyNotes platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
print(f"DEBUG: Including chat router with prefix /api")
app.include_router(chat_router, prefix="/api")

print(f"DEBUG: Registered routes: {[route.path for route in app.routes]}")

@app.on_event("startup")
async def startup_event():
    """Validate configuration and log startup information"""
    logger.info("Starting AAAnyNotes AI Service...")
    # Log configuration status
    try:
        available_models = settings.get_available_models()
        configured_models = [model for model, available in available_models.items() if available]
        
        print(f"DEBUG: Available models: {available_models}")
        print(f"DEBUG: Configured models: {configured_models}")
        
        if not configured_models:
            logger.warning("No AI models configured. Please set API keys in config/.env file.")
            logger.info("Available models to configure: GLM, OpenAI, Claude, Kimi")
            logger.info("See config/.env for configuration template")
        else:
            logger.info(f"Configured models: {', '.join(configured_models)}")
            logger.info(f"Default model: {settings.default_model}")
        
        # Log debug mode
        if settings.debug:
            logger.info("Debug mode enabled")
            print("DEBUG: Debug mode is enabled")
        
        # Log service URLs
        logger.info("Service URLs:")
        logger.info("   - API Documentation: http://localhost:8000/docs")
        logger.info("   - ReDoc Documentation: http://localhost:8000/redoc")
        logger.info("   - Health Check: http://localhost:8000/health")
        
        logger.info("AAAnyNotes AI Service started successfully!")
        print("DEBUG: Service startup completed successfully")
        
    except Exception as e:
        print(f"DEBUG: Startup error: {str(e)}")
        import traceback
        print(f"DEBUG: Startup traceback: {traceback.format_exc()}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    print("DEBUG: Health check endpoint called")
    try:
        available_models = settings.get_available_models()
        configured_models = [model for model, available in available_models.items() if available]
        
        return {
            "status": "healthy",
            "service": "AAAnyNotes AI Service",
            "version": "1.0.0",
            "configured_models": configured_models,
            "default_model": settings.default_model,
            "debug_mode": settings.debug
        }
    except Exception as e:
        print(f"ERROR: Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "AAAnyNotes AI Service",
            "error": str(e)
        }

@app.get("/")
async def root():
    """Root endpoint"""
    print("DEBUG: Root endpoint called")
    return {
        "message": "AAAnyNotes AI Service",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }

print("DEBUG: FastAPI app configured and ready to run")

if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting uvicorn server...")
    print("DEBUG: About to start uvicorn server")
    print(f"DEBUG: Host: 0.0.0.0, Port: 8000")
    print(f"DEBUG: Debug mode: {settings.debug}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        # log_level="debug",  # Force debug logging
        # access_log=True  # Enable access logs
    )
