# Environment Configuration Documentation

## Module Overview
Centralized configuration management for AAAnyNotes application, covering build settings, environment variables, and deployment configurations across all services.

## Configuration Structure
```
config/
©À©¤©¤ models.json              # Model definitions and capabilities
©À©¤©¤ environment.yaml          # Environment-specific settings
©À©¤©¤ build.json              # Build configuration
©¸©¤©¤ deploy.json             # Deployment settings
```

## Key Configuration Files

### Model Configuration (`models.json`)
**Purpose**: Central model registry with capabilities and provider information
**Structure**:
```json
{
  "models": [
    {
      "id": "kimi-k2-turbo-preview",
      "name": "Kimi K2 Turbo",
      "provider": "Moonshot AI",
      "description": "Moonshot AI Kimi model, high-speed response",
      "type": "kimi",
      "envKey": "MOONSHOT_API_KEY",
      "enabled": true,
      "maxTokens": 32768,
      "temperature": {
        "min": 0.0,
        "max": 2.0,
        "default": 0.3
      },
      "features": ["chat", "streaming", "long-context"],
      "supportsThinkingMode": false
    },
    {
      "id": "kimi-k2-thinking",
      "name": "Kimi K2 Thinking",
      "provider": "Moonshot AI",
      "description": "Moonshot AI Kimi model with thinking capabilities",
      "type": "kimi",
      "envKey": "MOONSHOT_API_KEY",
      "enabled": true,
      "maxTokens": 32768,
      "temperature": {
        "min": 0.0,
        "max": 2.0,
        "default": 0.3
      },
      "features": ["chat", "streaming", "long-context", "thinking"],
      "supportsThinkingMode": true
    }
  ],
  "defaultModel": "kimi-k2-turbo-preview",
  "modelTypes": { /* ... */ },
  "categories": { /* ... */ }
}
```

### Environment Variables
**Development Environment**:
```bash
# AI Model API Keys
KIMI_API_KEY=your_moonshot_api_key
GLM_API_KEY=your_zhipu_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
AZURE_API_KEY=your_azure_openai_key
GEMINI_API_KEY=your_gemini_api_key
BAIDU_API_KEY=your_baidu_api_key
TENCENT_API_KEY=your_tencent_api_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aaanynotes
DB_USER=postgres
DB_PASSWORD=your_password

# Service Configuration
GO_HTTP_PORT=8080
PYTHON_HTTP_PORT=8000
FRONTEND_PORT=5173

# Build and Deployment
NODE_ENV=development
LOG_LEVEL=debug
ENVIRONMENT=local
```

**Production Environment**:
```bash
# Production API endpoints
KIMI_API_KEY=${KIMI_API_KEY_PROD}
GLM_API_KEY=${GLM_API_KEY_PROD}
OPENAI_API_KEY=${OPENAI_API_KEY_PROD}

# Production database
DB_HOST=${DB_HOST_PROD}
DB_PORT=${DB_PORT_PROD}
DB_NAME=${DB_NAME_PROD}
DB_USER=${DB_USER_PROD}
DB_PASSWORD=${DB_PASSWORD_PROD}

# Production ports
GO_HTTP_PORT=8080
PYTHON_HTTP_PORT=8000
FRONTEND_PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

## Service Configuration

### Go Backend Configuration
**File**: `backend/go/internal/config/config.go`
**Purpose**: Application settings and dependency injection
```go
type Config struct {
    ServerPort    int           `env:"GO_HTTP_PORT"`
    DatabaseURL   string        `env:"DATABASE_URL"`
    JWTSecret     string        `env:"JWT_SECRET"`
    LogLevel      string        `env:"LOG_LEVEL"`
    Environment   string        `env:"ENVIRONMENT"`
    KimiAPIKey   string        `env:"KIMI_API_KEY"`
    GLMAPIKey    string        `env:"GLM_API_KEY"`
}
```

### Python Backend Configuration
**File**: `backend/python/src/config/app_settings.py`
**Purpose**: Application settings and model configuration
```python
from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "AAAnyNotes AI Service"
    debug: bool = False
    environment: str = "development"
    
    # API Keys
    kimi_api_key: str = Field(..., env="KIMI_API_KEY")
    glm_api_key: str = Field(..., env="GLM_API_KEY")
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    
    # Service Configuration
    python_http_port: int = 8000
    go_http_port: int = 8080
    frontend_port: int = 5173
    
    # Feature Flags
    enable_thinking_mode: bool = True
    enable_streaming: bool = True
    max_concurrent_requests: int = 10
```

### Frontend Configuration
**File**: `frontend/vite.config.ts`
**Purpose**: Build configuration and environment variables
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Environment variables for frontend
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.VITE_API_BASE_URL || 'http://localhost:8080'
    ),
    'import.meta.env.VITE_CHAT_WS_URL': JSON.stringify(
      process.env.VITE_CHAT_WS_URL || 'ws://localhost:8081'
    )
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV === 'development',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'antd'],
          chat: ['./src/components/chat'],
          api: ['./src/api']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
});
```

## Development Environment Setup

### Local Development
```bash
# Clone and setup
git clone <repository>
cd AAAnynotes

# Environment file setup
cp .env.example .env
# Edit .env with your API keys and settings

# Install dependencies
pnpm install
conda env create -f environment.yml
conda activate sj

# Start services
# Option 1: One-click startup
./start.bat  # Windows
./scripts/start-all.ps1  # PowerShell

# Option 2: Manual startup
cd backend/go && go run cmd/api/main.go &
cd backend/python && python src/main.py &
cd frontend && pnpm dev &
```

### Environment Files
**`.env.example`**:
```bash
# AI Model API Keys
KIMI_API_KEY=your_kimi_api_key_here
GLM_API_KEY=your_glm_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here


# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/aaanynotes

# Service Ports
GO_HTTP_PORT=8080
PYTHON_HTTP_PORT=8000
FRONTEND_PORT=5173

# Environment Settings
NODE_ENV=development
LOG_LEVEL=debug
ENVIRONMENT=local
```

## Production Deployment

### Environment Variables
**Docker Environment**:
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    environment:
      - VITE_API_BASE_URL=http://api:8080
      - NODE_ENV=production
    ports:
      - "3000:3000"
      
  go-backend:
    build: ./backend/go
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - KIMI_API_KEY=${KIMI_API_KEY}
      - GLM_API_KEY=${GLM_API_KEY}
    ports:
      - "8080:8080"
      
  python-backend:
    build: ./backend/python
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - KIMI_API_KEY=${KIMI_API_KEY}
      - GLM_API_KEY=${GLM_API_KEY}
    ports:
      - "8000:8000"
```

**Kubernetes Configuration**:
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aaanynotes-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aaanynotes-frontend
  template:
    metadata:
      labels:
        app: aaanynotes-frontend
    spec:
      containers:
      - name: frontend
        image: aaanynotes/frontend:latest
        ports:
        - containerPort: 3000
        env:
          - name: NODE_ENV
            value: "production"
          - name: VITE_API_BASE_URL
            value: "http://aaanynotes-api:8080"
```

## Configuration Management Best Practices

### Security
```bash
# Use secrets management
# Never commit .env files to version control
# Use environment-specific configs
# Implement proper secret rotation

```

### Validation
```python
# Configuration validation with Pydantic
class Settings(BaseSettings):
    app_name: str = Field(..., min_length=1, max_length=100)
    port: int = Field(..., ge=1, le=65535)
    api_key: str = Field(..., regex=r'^[a-zA-Z0-9_-]+$')
    
    class Config:
        env_file = '.env'
        case_sensitive = False
```

### Feature Flags
```yaml
# Feature flag configuration
features:
  thinking_mode: true
  streaming: true
  multi_model: true
  real_time_collaboration: false
  advanced_analytics: false
```

## Build Configuration

### Go Build
```bash
# Build for production
go build -o bin/aaanynotes ./cmd/api

# Cross-platform builds
GOOS=linux GOARCH=amd64 go build -o bin/aaanynotes-linux ./cmd/api
GOOS=windows GOARCH=amd64 go build -o bin/aaanynotes.exe ./cmd/api
```

### Python Build
```bash
# Package for deployment
pip install -r requirements.txt
python -m PyInstaller --onefile src/main.py
```

### Frontend Build
```bash
# Production build
pnpm build
# Build preview
pnpm preview
# Analyze bundle
pnpm build --analyze
```

## Monitoring and Logging

### Structured Logging
```python
# Python logging configuration
import logging
import structlog

logger = structlog.get_logger()
logger.info("Service started", extra={
    "service": "aaanynotes-ai",
    "version": "1.0.0",
    "environment": settings.environment
})
```

### Health Checks
```go
// Health endpoint implementation
func (h *HealthHandler) Check(c *gin.Context) {
    status := map[string]interface{}{
        "status": "healthy",
        "timestamp": time.Now().UTC(),
        "version": os.Getenv("APP_VERSION"),
        "environment": os.Getenv("ENVIRONMENT"),
    }
    c.JSON(200, status)
}
```

---

**This documentation covers complete configuration management across all services, including environment setup, deployment strategies, and best practices.**
