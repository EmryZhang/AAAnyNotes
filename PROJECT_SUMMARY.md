# AAAnyNotes Project Structure Guide

## Core Principles
1. **No encoding issues**: Always use UTF-8 encoding for generated code
2. **Continuous updates**: Review and update this file after every significant change

## Technology Stack

### Frontend
- **Tech**: React 19.1.1 + TypeScript 5.9.3 + Vite 7.1.7 + Ant Design 5.27.6
- **State**: Redux + React Redux
- **Port**: 5173
- **Dev Commands**: `pnpm dev`, `pnpm build`, `pnpm lint`

### Backend

#### Go API (Port 8080)
- **Framework**: Gin 1.11.0
- **Architecture**: Clean Architecture + DDD
- **Dev Commands**: `go run cmd/api/main.go`, `go build ./...`, `go test ./...`

#### Python API (Port 8000)
- **Framework**: FastAPI 0.104.1 + Uvicorn 0.24.0
- **Environment**: Conda "sj"
- **Dev Commands**: `conda activate sj && python src/main.py`

## Directory Structure

### Frontend (frontend/src/)
```
src/
├── api/chat.ts              # Chat API interfaces
├── components/
│   ├── auth/               # Auth: AuthModal, LoginForm, RegisterForm
│   ├── chat/               # Chat: AIChatInterface
│   └── layout/             # Layout: Card, CardGrid, Header, Sidebar
├── context/AuthContext.tsx # Auth state management
├── types/                  # auth.ts, chat.ts type definitions
└── main.tsx, App.tsx       # Entry points
```

### Go Backend (backend/go/)
```
backend/go/
├── cmd/api/main.go         # Server entry point
├── internal/
│   ├── domain/            # Domain models: card/, chat/, share/
│   ├── infrastructure/    # gRPC client, storage
│   └── interface/http/    # Routes, handlers
└── pkg/                   # Reusable packages
```

### Python Backend (backend/python/)
```
backend/python/
├── src/main.py            # FastAPI entry
├── src/api/endpoints/     # Chat endpoint
├── src/common/models.py   # Shared models
└── src/services/         # Business logic: chat/, card/, search/
```

## Communication Flow
```
React (5173) ←→ Go API (8080) ←→ Python API (8000)
     HTTP           REST/gRPC        FastAPI
```

## Code Standards

### Go
- `go fmt` for formatting
- camelCase vars, PascalCase exports
- Clean Architecture layers

### Python  
- PEP 8 compliance
- Pydantic models for validation
- Type hints required

### TypeScript/React
- ESLint configuration
- Functional components + Hooks
- Ant Design patterns

## Development Workflow

### Quick Start
```bash
./start.bat  # All services on Windows
```

### Individual Services
```bash
# Frontend
cd frontend && pnpm dev

# Go API  
cd backend/go && go run cmd/api/main.go

# Python API
cd backend/python && conda activate sj && python src/main.py
```

## Functional Modules

1. **Authentication**: User registration, login, session management
2. **Card Management**: CRUD operations, categorization, search
3. **AI Chat**: Conversation interface, Q&A, context management
4. **Data Sharing**: Cross-service synchronization, real-time updates

## Critical Rules
- **Always check encoding**: Ensure UTF-8 for all generated files
- **Update this document**: Modify after each architectural change
- **Follow patterns**: Use existing component and service patterns
- **Test locally**: Verify functionality before commit

## File Creation Guidelines
- Use existing naming conventions
- Follow established import patterns
- Maintain separation of concerns
- Add necessary type definitions
- Include error handling where appropriate
