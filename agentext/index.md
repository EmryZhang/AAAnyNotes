# AAAnyNotes - AI-Powered Knowledge Garden

## Project Overview
AAAnyNotes is a full-stack notes application with AI-powered conversation capabilities. It combines traditional note-taking with modern AI chat interfaces for an enhanced knowledge management experience.

### System Architecture
```
Frontend (React + TypeScript)  <--->  Go API Server  <--->  Python AI Service
     (UI Components)           (HTTP/gRPC)       (FastAPI + LLM)
```

### Core Technologies
- **Frontend**: React 19.2.0 + TypeScript, Vite build system, Ant Design UI components
- **Go Backend**: Gin framework, GORM database operations, HTTP/gRPC communication
- **Python Backend**: FastAPI, async processing, multiple LLM provider support
- **AI Integration**: Kimi, GLM, OpenAI, Claude, and more via configurable mappings


## Key Features

### Knowledge Management
- Card-based note organization with metadata
- Grid-based layout for visual navigation
- Rich text editing and categorization
- Search and filtering capabilities


### AI-Powered Conversation
- Multi-model chat interface with streaming responses
- Model selection and configuration management
- Thinking mode support for enhanced reasoning
- Real-time streaming with error handling


### Cross-Platform Integration
- Model ID mapping system for flexible provider switching
- Environment-based configuration management
- Multi-language support (Chinese/English optimized)
- Enterprise-grade security options


## Development Workflow

### Quick Start
1. **Windows Users**: Run `start.bat` for one-click startup
2. **PowerShell Users**: Run `scripts/start-all.ps1` for managed startup
3. **Manual Start**: Follow service-specific commands below


### Service Management
- **Frontend**: `cd frontend && pnpm dev` (http://localhost:5173)
- **Go Backend**: `cd backend/go && go run cmd/api/main.go` (http://localhost:8080)
- **Python Backend**: `cd backend/python && conda activate sj && python src/main.py` (http://localhost:8000)

## Code Organization

### Modular Architecture
- **agentext/**: Enhanced context documentation and routing
- **config/**: Centralized configuration and model definitions
- **frontend/**: React UI with TypeScript strict typing
- **backend/**: Polyglot services with clear separation
- **scripts/**: Build automation and deployment utilities


### Documentation System
- **AGENTS.md**: Core development guidelines and policies
- **agentext/router.md**: Intelligent routing to specific modules
- **Module-specific docs**: Detailed implementation guides
- **Language requirements**: English-only development content

## Best Practices

### Code Quality
- TypeScript strict mode with comprehensive type definitions
- Go standard formatting and testing patterns
- Python PEP 8 compliance with Pydantic validation
- Comprehensive error handling and logging

### Performance
- Async processing for AI service responsiveness
- Optimized database queries with proper indexing
- Frontend lazy loading and code splitting
- Streaming responses for real-time user experience

### Security
- JWT-based authentication with configurable middleware
- Environment variable management for API keys
- Input validation and sanitization
- CORS and security headers configuration

## AI Model Integration

### Supported Providers
- **Kimi (Moonshot AI)**: kimi-k2-turbo-preview, kimi-k2-thinking
- **GLM (Zhipu AI)**: glm-4, glm-3-turbo
- **OpenAI**: gpt-4, gpt-3.5-turbo
- **Claude**: claude-3-sonnet-20240229, claude-3-opus-20240229
- **And more**: Azure, Gemini, ERNIE, Hunyuan, etc.

### Model Features
- **Thinking Mode**: Advanced reasoning for supported models
- **Streaming**: Real-time response streaming
- **Long Context**: Extended conversation history
- **Multi-lingual**: Chinese and English optimization
- **Specialized**: Code generation, analysis, etc.

## Deployment & Operations

### Environment Configuration
- Development: Local development with hot reload
- Production: Optimized builds with minimal dependencies
- Testing: Comprehensive test coverage across all layers
- Monitoring: Structured logging and error tracking

### Scaling Considerations
- Frontend: CDN-based asset delivery, code splitting
- Backend: Horizontal scaling with gRPC communication
- Database: Connection pooling and query optimization
- AI Services: Load balancing and failover mechanisms

## Future Roadmap

### Short Term
- Enhanced AI reasoning capabilities
- Improved mobile responsiveness
- Advanced search and filtering
- Real-time collaboration features

### Long Term
- Multi-user support with permissions
- Advanced analytics and insights
- Plugin system for extensibility
- Cloud deployment options

---

## Quick Reference
### Essential Commands
```bash
# Development
cd frontend && pnpm dev          # Frontend dev server
cd backend/go && go run cmd/api/main.go  # Go API server
cd backend/python && python src/main.py  # Python AI service


# Testing
cd frontend && pnpm test         # Frontend testscd backend/go && go test ./...     # Go tests
cd backend/python && pytest          # Python tests


# Building
cd frontend && pnpm build        # Frontend production build
cd backend/go && go build ./...    # Go binaries
```

### Configuration Files
- `config/models.json`: Model definitions and capabilities
- `backend/go/internal/config/`: Service configuration
- `backend/python/src/config/`: Python service settings
- `frontend/vite.config.ts`: Frontend build configuration


### Key Locations
- Frontend components: `frontend/src/components/`
- Go API handlers: `backend/go/internal/interface/http/handlers/`
- Python services: `backend/python/src/services/chat/`
- Model mappings: `backend/python/src/config/model_mappings.py`

---

**This document serves as the primary entry point for understanding the AAAnyNotes project architecture, development workflow, and implementation patterns.**
