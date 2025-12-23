# Enhanced Agent Context Router

## Document Structure

### Main Documentation
- `index.md`: Project architecture, vision, and working rules (MUST READ FIRST)
- `router.md`: This file - detailed routing guide with module-specific decision trees

### Module Documentation
- `frontend/ui-components.md`: React components, UI development, TypeScript patterns
- `backend-go/http-api.md`: Go API server, HTTP handlers, GORM database operations
- `backend-python/ai-chat.md`: FastAPI AI service, chat endpoints, async processing
- `config/environment-config.md`: Environment setup, build configuration, deployment
- `development/development-workflow.md`: Development processes, testing, Git workflow


## Module-Specific Decision Trees

### Frontend Module Decision Tree
**Keywords**: React, TypeScript, component, UI, Vite, Ant Design, frontend, page, auth, chat interface

1. **Component Development** -> `frontend/ui-components.md`
   - Keywords: component, UI, form, modal, layout
   - Files: `frontend/src/components/`, `frontend/src/pages/`

2. **Authentication & Auth Flow** -> `frontend/ui-components.md`
   - Keywords: login, register, auth, token, user session
   - Files: `frontend/src/context/AuthContext.tsx`

3. **Chat Interface & AI Integration** -> `frontend/ui-components.md`
   - Keywords: chat, AI interface, conversation, message
   - Files: `frontend/src/components/chat/`, `frontend/src/api/chat.ts`

4. **Card Management & Layout** -> `frontend/ui-components.md`
   - Keywords: card, grid, layout, note, knowledge card
   - Files: `frontend/src/components/layout/`, `frontend/src/components/Card.tsx`

5. **TypeScript Types & API Integration** -> `frontend/ui-components.md`
   - Keywords: types, interface, API call, service
   - Files: `frontend/src/types/`, `frontend/src/api/`

6. **Services & State Management** -> `frontend/ui-components.md`
   - Keywords: service, state, context, provider
   - Files: `frontend/src/services/`, `frontend/src/context/`

### Go Backend Decision Tree
**Keywords**: Go, Gin, API, HTTP, database, server, backend, GORM, middleware, auth, notes

1. **API Routes & HTTP Handlers** -> `backend-go/http-api.md`
   - Keywords: route, handler, endpoint, HTTP request
   - Files: `backend/go/internal/interface/http/`

2. **Database Operations & Models** -> `backend-go/http-api.md`
   - Keywords: database, model, GORM, CRUD, data storage
   - Files: `backend/go/internal/domain/`, `backend/go/internal/infrastructure/storage`

3. **Authentication & Middleware** -> `backend-go/http-api.md`
   - Keywords: auth, JWT, middleware, security, token validation
   - Files: `backend/go/internal/config/`, auth handlers

4. **gRPC Communication with Python** -> `backend-go/http-api.md`
   - Keywords: gRPC, Python client, AI communication, streaming
   - Files: `backend/go/internal/infrastructure/grpc/`

5. **Business Logic & Services** -> `backend-go/http-api.md`
   - Keywords: service, business logic, processing, validation
   - Files: `backend/go/internal/domain/`, domain layer

6. **Configuration & Environment** -> `backend-go/http-api.md`
   - Keywords: config, environment, build, deployment
   - Files: `backend/go/internal/config/`


### Python Backend Decision Tree
**Keywords**: Python, FastAPI, chat, AI, async, Pydantic, streaming, LLM

1. **Chat API Endpoints** -> `backend-python/ai-chat.md`
   - Keywords: endpoint, API, route, FastAPI, HTTP
   - Files: `backend/python/src/api/endpoints/`, `backend/python/src/main.py`

2. **AI Service & LLM Integration** -> `backend-python/ai-chat.md`
   - Keywords: AI service, LLM, chat processing, streaming response
   - Files: `backend/python/src/services/chat/`, `backend/python/src/models/`

3. **Data Models & Validation** -> `backend-python/ai-chat.md`
   - Keywords: model, Pydantic, validation, schema, data structure
   - Files: `backend/python/src/common/models.py`, model definitions

4. **Async Processing & Performance** -> `backend-python/ai-chat.md`
   - Keywords: async, streaming, performance, concurrency
   - Files: FastAPI async patterns, streaming implementations

5. **Configuration & Environment** -> `backend-python/ai-chat.md`
   - Keywords: config, environment, API keys, service setup
   - Files: `backend/python/src/config/`, environment files

6. **Model Mapping & Integration** -> `backend-python/ai-chat.md`
   - Keywords: model mapping, factory pattern, LLM integration
   - Files: `backend/python/src/config/model_mappings.py`, `backend/python/src/models/`

### Configuration & Development Decision Tree
**Keywords**: config, environment, deploy, build, setup, development, test, workflow

1. **Environment Setup & Configuration** -> `config/environment-config.md`
   - Keywords: setup, config, environment variables, deployment
   - Files: `config/`, environment files, build scripts

2. **Development Workflow & Testing** -> `development/development-workflow.md`
   - Keywords: test, build, development, Git, workflow, debugging
   - Files: `scripts/`, test files, development processes


## Updated File Locations Based on Actual Structure

### Frontend Structure
```
frontend/
|-- src/
|   |-- components/
|   |   |-- chat/           # AI chat interface (AIChatInterface.tsx)
|   |   |-- layout/         # Layout components (CardGrid.tsx, Header.tsx, Sidebar.tsx)
|   |-- context/             # React contexts (AuthContext.tsx)
|   |-- types/               # TypeScript type definitions (auth.ts, chat.ts)
|   |-- api/                 # API service layer (chat.ts)
|   |-- services/             # Service layer (modelService.ts)
|-- public/                  # Static assets
|-- dist/                    # Production build output
```

### Go Backend Structure
```
backend/go/
|-- cmd/
|   |-- api/
|       |-- main.go          # Application entry point
|-- internal/
|   |-- config/              # Configuration layer (config.go)
|   |-- domain/              # Domain models and business logic
|   |   |-- card/
|   |   |-- chat/
|   |   |   |-- model/      # Chat domain models (model.go)
|   |   |   |-- service/     # Chat services (service.go)
|   |   |-- share/         # Shared domain models
|   |-- infrastructure/     # Infrastructure layer
|   |   |-- grpc/
|   |   |-- storage/       # Database storage layer
|   |-- interface/
|       |-- http/           # HTTP interface layer
|           |-- routes.go   # Route definitions
|           |-- handlers/   # HTTP handlers (chat_handler.go)
```

### Python Backend Structure
```
backend/python/
|-- src/
|   |-- main.py             # FastAPI application entry point
|   |-- api/
|   |   |-- endpoints/      # API endpoints (chat_endpoint.py)
|   |-- common/
|   |   |-- models.py       # Common data models
|   |-- config/
|   |   |-- __init__.py    # Configuration classes (GLMConfig, KimiConfig, etc.)
|   |   |-- model_mappings.py # Model ID to type mapping
|   |   |-- app_settings.py # Application settings
|   |-- services/
|   |   |-- chat/           # Chat services (chat_service.py)
|   |-- models/
|       |-- kimi_model.py  # Kimi model implementation
|       |-- glm_model.py   # GLM model implementation
```

## Advanced Usage Examples with Specific Routing

### Frontend-Specific Examples

**User says**: Fix login form validation ¡ú Route to: `frontend/ui-components.md` + check `frontend/src/context/AuthContext.tsx`

**User says**: Add loading state to AI chat interface ¡ú Route to: `frontend/ui-components.md` + check `frontend/src/components/chat/AIChatInterface.tsx`

**User says**: Update card grid layout for responsive design ¡ú Route to: `frontend/ui-components.md` + check `frontend/src/components/layout/CardGrid.tsx`

**User says**: Update model service for new model mapping ¡ú Route to: `frontend/ui-components.md` + check `frontend/src/services/modelService.ts`

### Go Backend-Specific Examples

**User says**: API endpoint for notes returns 500 error ¡ú Route to: `backend-go/http-api.md` + check handlers and routes in `backend/go/internal/interface/http/`

**User says**: Fix JWT token validation middleware ¡ú Route to: `backend-go/http-api.md` + check auth implementation in `backend/go/internal/config/`

**User says**: Optimize GORM database queries for chat history ¡ú Route to: `backend-go/http-api.md` + check domain models in `backend/go/internal/domain/`

**User says**: Debug gRPC communication with Python AI service ¡ú Route to: `backend-go/http-api.md` + check `backend/go/internal/infrastructure/grpc/`

### Python Backend-Specific Examples

**User says**: Chat streaming response is not working properly ¡ú Route to: `backend-python/ai-chat.md` + check `backend/python/src/api/endpoints/chat_endpoint.py`

**User says**: Improve LLM response processing performance ¡ú Route to: `backend-python/ai-chat.md` + check `backend/python/src/services/chat/chat_service.py`

**User says**: Add Pydantic validation for new chat message schema ¡ú Route to: `backend-python/ai-chat.md` + check `backend/python/src/common/models.py`

**User says**: Fix model mapping for new Kimi K2 Turbo model ¡ú Route to: `backend-python/ai-chat.md` + check `backend/python/src/config/model_mappings.py`

### Cross-Module Examples

**User says**: End-to-end authentication flow not working ¡ú Route to: `frontend/ui-components.md` + `backend-go/http-api.md` + check auth components and handlers

**User says**: AI chat feature integration between frontend and Python backend ¡ú Route to: `frontend/ui-components.md` + `backend-go/http-api.md` + `backend-python/ai-chat.md`

**User says**: Set up complete development environment ¡ú Route to: `development/development-workflow.md` + `config/environment-config.md`

## Documentation Principles

### Mandatory Routing Rules
1. **ALWAYS start with `index.md`** to understand project context
2. **Use keywords to identify primary module** for task
3. **Follow module-specific decision tree** for detailed routing
4. **Load cross-module docs** for integrated features
5. **Verify file locations** using updated structure mapping

### Content Format Consistency
Each module MD follows this structure:
1. **Module Focus**: Role and responsibilities in system
2. **File Locations**: Precise file paths based on actual structure
3. **Feature Implementation**: Current functionality and patterns
4. **Technical Patterns**: Technologies, coding style, and best practices

### Routing Priority
1. **Module-specific** (single responsibility) ¡ú Load target module MD
2. **Cross-module integration** ¡ú Load all relevant module MDs + index.md
3. **Architectural questions** ¡ú Load index.md only
4. **Development setup** ¡ú Load development + config MDs

## Enhanced Features for AGENTS.md Compliance

### English-Only Policy Compliance
- All code comments MUST be in English (per AGENTS.md)
- All debug output MUST use English text
- All log messages MUST be in English
- Error messages: English only
- Variable names: English only (new ones)

### Language Requirements
- Frontend: TypeScript with ESLint configuration
- Go: Standard Go formatting (`go fmt`)
- Python: PEP 8 style, Pydantic models for validation

### Testing Guidelines
- Go: Use standard `testing` package with `_test.go` suffix
- Python: Use pytest for FastAPI endpoint testing
- Frontend: React Testing Library for component tests

### Build, Test, and Development Commands
Frontend (React/TypeScript):
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

Go Backend:
```bash
cd backend/go
go run cmd/api/main.go    # Run development server
go build ./...           # Build all packages
go test ./...             # Run tests
```

Python Backend:
```bash
cd backend/python
conda activate sj           # Activate conda environment
python src/main.py          # Run FastAPI server
```
