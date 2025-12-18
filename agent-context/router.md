# Agent Context Router

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
   - Files: `frontend/src/components/auth/`, `frontend/src/context/AuthContext.tsx`

3. **Chat Interface & AI Integration** -> `frontend/ui-components.md`
   - Keywords: chat, AI interface, conversation, message
   - Files: `frontend/src/components/chat/`, `frontend/src/api/chat.ts`

4. **Card Management & Layout** -> `frontend/ui-components.md`
   - Keywords: card, grid, layout, note, knowledge card
   - Files: `frontend/src/components/layout/`, `frontend/src/components/Card.tsx`

5. **TypeScript Types & API Integration** -> `frontend/ui-components.md`
   - Keywords: types, interface, API call, service
   - Files: `frontend/src/types/`, `frontend/src/api/`

### Go Backend Decision Tree
**Keywords**: Go, Gin, API, HTTP, database, server, backend, GORM, middleware, auth, notes

1. **API Routes & HTTP Handlers** -> `backend-go/http-api.md`
   - Keywords: route, handler, endpoint, HTTP request
   - Files: `backend/go/internal/interface/http/`, `backend/go/internal/interface/http/routes.go`

2. **Database Operations & Models** -> `backend-go/http-api.md`
   - Keywords: database, model, GORM, CRUD, data storage
   - Files: `backend/go/internal/domain/`, `backend/go/internal/infrastructure/`

3. **Authentication & Middleware** -> `backend-go/http-api.md`
   - Keywords: auth, JWT, middleware, security, token validation
   - Files: `backend/go/internal/middleware/`, auth handlers

4. **gRPC Communication with Python** -> `backend-go/http-api.md`
   - Keywords: gRPC, Python client, AI communication, streaming
   - Files: `backend/go/internal/infrastructure/grpc/`, `python_client.go`

5. **Business Logic & Services** -> `backend-go/http-api.md`
   - Keywords: service, business logic, processing, validation
   - Files: `backend/go/internal/services/`, domain layer

### Python Backend Decision Tree
**Keywords**: Python, FastAPI, chat, AI, async, Pydantic, streaming, LLM

1. **Chat API Endpoints** -> `backend-python/ai-chat.md`
   - Keywords: endpoint, API, route, FastAPI, HTTP
   - Files: `backend/python/src/api/endpoints/`, `backend/python/src/main.py`

2. **AI Service & LLM Integration** -> `backend-python/ai-chat.md`
   - Keywords: AI service, LLM, chat processing, streaming response
   - Files: `backend/python/src/services/chat/`, `chat_service.py`

3. **Data Models & Validation** -> `backend-python/ai-chat.md`
   - Keywords: model, Pydantic, validation, schema, data structure
   - Files: `backend/python/src/common/models.py`, Pydantic models

4. **Async Processing & Performance** -> `backend-python/ai-chat.md`
   - Keywords: async, streaming, performance, concurrency
   - Files: FastAPI async patterns, streaming implementations

### Configuration & Development Decision Tree
**Keywords**: config, environment, deploy, build, setup, development, test, workflow

1. **Environment Setup & Configuration** -> `config/environment-config.md`
   - Keywords: setup, config, environment variables, deployment
   - Files: `config/`, environment files, build scripts

2. **Development Workflow & Testing** -> `development/development-workflow.md`
   - Keywords: test, build, development, Git, workflow, debugging
   - Files: `scripts/`, test files, development processes

## Detailed File Locations (Updated Based on Actual Structure)

### Frontend Structure
```
frontend/
|-- src/
|   |-- components/
|   |   |-- auth/           # Authentication components (AuthModal, LoginForm, RegisterForm)
|   |   |-- chat/           # AI chat interface (AIChatInterface)
|   |   |-- layout/         # Layout components (Card, CardGrid, Header, Sidebar)
|   |-- context/             # React contexts (AuthContext)
|   |-- types/               # TypeScript type definitions (auth.ts, chat.ts)
|   |-- api/                 # API service layer (chat.ts)
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
|   |-- domain/              # Domain models and business logic
|   |   |-- chat/
|   |       |-- model/      # Chat domain models (chat.go)
|   |-- infrastructure/     # Infrastructure layer
|   |   |-- grpc/
|   |       |-- python_client.go  # gRPC Python client
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
|   |-- services/
|       |-- chat/           # Chat services (chat_service.py)
|-- tests/                   # Test files
|-- requirements.txt         # Python dependencies
```

## Advanced Usage Examples with Specific Routing

### Frontend-Specific Examples

**User says**: Fix the login form validation n-> Route to: `frontend/ui-components.md` + check `frontend/src/components/auth/LoginForm.tsx`

**User says**: Add loading state to AI chat interface n-> Route to: `frontend/ui-components.md` + check `frontend/src/components/chat/AIChatInterface.tsx`

**User says**: Update card grid layout for responsive design n-> Route to: `frontend/ui-components.md` + check `frontend/src/components/layout/CardGrid.tsx`

**User says**: Add TypeScript types for new chat message format n-> Route to: `frontend/ui-components.md` + check `frontend/src/types/chat.ts`

### Go Backend-Specific Examples

**User says**: API endpoint for notes returns 500 error n-> Route to: `backend-go/http-api.md` + check handlers and routes in `backend/go/internal/interface/http/`

**User says**: Fix JWT token validation middleware n-> Route to: `backend-go/http-api.md` + check auth middleware implementation

**User says**: Optimize GORM database queries for chat history n-> Route to: `backend-go/http-api.md` + check domain models and database layer

**User says**: Debug gRPC communication with Python AI service n-> Route to: `backend-go/http-api.md` + check `backend/go/internal/infrastructure/grpc/python_client.go`

### Python Backend-Specific Examples

**User says**: Chat streaming response is not working properly n-> Route to: `backend-python/ai-chat.md` + check `backend/python/src/api/endpoints/chat_endpoint.py`

**User says**: Improve LLM response processing performance n-> Route to: `backend-python/ai-chat.md` + check `backend/python/src/services/chat/chat_service.py`

**User says**: Add Pydantic validation for new chat message schema n-> Route to: `backend-python/ai-chat.md` + check `backend/python/src/common/models.py`

### Cross-Module Examples

**User says**: End-to-end authentication flow not working n-> Route to: `frontend/ui-components.md` + `backend-go/http-api.md` + check auth components and handlers

**User says**: AI chat feature integration between frontend and Python backend n-> Route to: `frontend/ui-components.md` + `backend-go/http-api.md` + `backend-python/ai-chat.md`

**User says**: Set up the complete development environment n-> Route to: `development/development-workflow.md` + `config/environment-config.md`

## Documentation Principles

### Mandatory Routing Rules
1. **ALWAYS start with `index.md`** to understand project context
2. **Use keywords to identify primary module** for the task
3. **Follow module-specific decision tree** for detailed routing
4. **Load cross-module docs** for integrated features
5. **Verify file locations** using the updated structure mapping

### Content Format Consistency
Each module MD follows this structure:
1. **Module Focus**: Role and responsibilities in the system
2. **File Locations**: Precise file paths based on actual structure
3. **Feature Implementation**: Current functionality and patterns
4. **Technical Patterns**: Technologies, coding style, and best practices

### Routing Priority
1. **Module-specific** (single responsibility) -> Load target module MD
2. **Cross-module integration** -> Load all relevant module MDs + index.md
3. **Architectural questions** -> Load index.md only
4. **Development setup** -> Load development + config MDs
