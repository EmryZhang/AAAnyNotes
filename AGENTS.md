# Repository Guidelines

## Project Structure & Module Organization

This is a full-stack notes application with a polyglot backend and React frontend:

- `frontend/` - React + TypeScript frontend with Vite build system
- `backend/go/` - Go HTTP API server using Gin framework
- `backend/python/` - Python FastAPI service for chat functionality
- `config/` - Configuration files for the application
- `docs/` - Project documentation
- `scripts/` - Build and deployment scripts

Frontend source files are in `frontend/src/` with dist builds in `frontend/dist/`. Go code follows standard project layout with `cmd/api/main.go` as entry point. Python services use `src/` directory structure.

## Build, Test, and Development Commands

### Frontend (React/TypeScript)
```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production (TypeScript compile + Vite build)
pnpm lint         # Run ESLint
pnpm preview      # Preview production build
```

### Backend (Go)
```bash
cd backend/go
go run cmd/api/main.go    # Run development server
go build ./...           # Build all packages
go test ./...             # Run tests
```

### Backend (Python)
```bash
cd backend/python
conda activate sj           # Activate conda environment
python src/main.py          # Run FastAPI server
```

## Coding Style & Naming Conventions

- **Frontend**: TypeScript with ESLint configuration. Use React functional components and hooks. Follow Ant Design component patterns.
- **Go**: Standard Go formatting (`go fmt`). Use camelCase for variables, PascalCase for exported types/functions.
- **Python**: PEP 8 style. FastAPI endpoints use Pydantic models for request/response validation.

## Testing Guidelines

- Go: Use standard `testing` package with `_test.go` suffix
- Python: Use pytest for FastAPI endpoint testing
- Frontend: React Testing Library for component tests

## Commit & Pull Request Guidelines

Commit messages follow conventional format:
- `init backend` - Initial backend setup
- `build up` - Build system configuration
- `stream send` - Feature implementation

PRs should include clear descriptions of changes and link to related issues when applicable.

## One-Click Startup

For Windows users, two startup options are available:

1. **Batch file**: Run `start.bat` from project root to launch all services in separate windows
2. **PowerShell script**: Run `scripts/start-all.ps1` for managed startup with job control

Both scripts will start:
- Go backend (http://localhost:8080)
- Python backend (http://localhost:8000) 
- React frontend (http://localhost:5173)

Note: Python backend requires conda environment "sj" to be configured.
