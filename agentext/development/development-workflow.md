# Development Workflow Documentation

## Module Overview
Comprehensive development workflow covering code management, testing, build processes, and deployment strategies for AAAnyNotes full-stack application.

## Development Environment Setup

### Prerequisites
- **Node.js** 18+ for frontend development
- **Go** 1.21+ for backend development
- **Python** 3.9+ for AI service development
- **Conda** for Python environment management
- **pnpm** for package management
- **Git** for version control

### Initial Setup
```bash
# Clone repository
git clone <repository-url>
cd AAAnyNotes

# Frontend setup
cd frontend
pnpm install

# Go backend setup
cd backend/go
go mod download

# Python backend setup
conda env create -f environment.yml
conda activate sj
cd backend/python
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
# Edit .env with your API keys and settings
```

## Development Services

### Local Development Startup
**Option 1: One-click Startup (Windows)**
```batch
@echo off
echo Starting AAAnyNotes development environment...

start cmd /k "cd /d %~dp0\backend\go && go run cmd\api\main.go" /title "Go Backend"
start cmd /k "cd /d %~dp0\backend\python && conda activate sj && python src/main.py" /title "Python AI Service"
start cmd /k "cd /d %~dp0\frontend && pnpm dev" /title "Frontend"
```

**Option 2: PowerShell Managed Startup**
```powershell
# scripts/start-all.ps1
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPath = Split-Path -Parent $scriptPath

Write-Host "Starting AAAnyNotes development environment..." -ForegroundColor Green

# Start Go backend
$goJob = Start-Job -ScriptBlock {
    Set-Location $rootPath\backend\go
    go run cmd\api\main.go
} -Name "Go-Backend"

# Start Python backend
$pythonJob = Start-Job -ScriptBlock {
    Set-Location $rootPath\backend\python
    conda activate sj; python src/main.py
} -Name "Python-AI-Service"

# Start Frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $rootPath\frontend
    pnpm dev
} -Name "Frontend-Dev"

# Wait for all jobs (optional)
# Wait-Job -Job $goJob, $pythonJob, $frontendJob
```

**Option 3: Manual Terminal Tabs**
```bash
# Terminal 1: Go Backend
cd backend/go
go run cmd/api/main.go

# Terminal 2: Python AI Service
cd backend/python
conda activate sj
python src/main.py

# Terminal 3: Frontend Development
cd frontend
pnpm dev
```

## Code Management Workflow

### Git Workflow Strategy
**Branch Strategy**:
- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature-specific branches
- `hotfix/*`: Emergency fixes
- `release/*`: Release preparation branches

### Commit Message Convention
```bash
# Format: <type>(<scope>): <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:     Code formatting (no logic change)
refactor: Code refactoring
perf:      Performance improvement
test:     Test addition/modification
chore:     Maintenance task

# Examples
feat(frontend): add AI chat interface
fix(backend): resolve model mapping issue
docs(readme): update setup instructions
refactor(backend): optimize database queries
perf(frontend): implement lazy loading
test(backend): add integration tests
chore(deps): update dependencies
```

### Pull Request Process
1. **Create Feature Branch**:
```bash
git checkout -b feature/ai-chat-interface develop
```

2. **Development and Testing**:
```bash
# Make changes
# Run tests
pnpm test  # Frontend
go test ./...  # Go backend
pytest          # Python backend

# Code quality checks
pnpm lint    # Frontend ESLint
go fmt ./... # Go formatting
black .       # Python formatting
```

3. **Create Pull Request**:
```bash
git push origin feature/ai-chat-interface
git checkout main
git merge --no-ff feature/ai-chat-interface
git push origin main
```

## Testing Strategy

### Unit Testing
**Frontend (React Testing Library)**:
```typescript
// Example component test
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChatInterface from '../components/chat/AIChatInterface';

describe('AIChatInterface', () => {
  test('renders chat interface', () => {
    render(<AIChatInterface visible={true} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  test('sends message on enter', async () => {
    render(<AIChatInterface visible={true} />);
    const input = screen.getByPlaceholderText('Type your message here..');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });
});
```

**Go Backend (Testing Package)**:
```go
// Example handler test
func TestChatHandler(t *testing.T) {
    gin.SetMode(gin.TestMode)
    
    // Mock request
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    
    // Test handler
    HandleChat(c)
    
    // Assert response
    assert.Equal(t, 200, w.Code)
    assert.Contains(t, w.Body.String(), "success")
}
```

**Python Backend (Pytest)**:
```python
# Example service test
def test_chat_service_stream():
    # Mock dependencies
    with patch('src.services.chat.chat_service.create_model') as mock_create:
        mock_model = Mock()
        mock_model.stream_chat.return_value = [
            StreamChunk(content="Hello", finished=False),
            StreamChunk(content="!", finished=True)
        ]
        mock_create.return_value = mock_model
        
        # Test service
        service = ChatService()
        chunks = list(service.stream_chat(mock_request))
        
        # Assert results
        assert len(chunks) == 2
        assert chunks[0].content == "Hello"
        assert chunks[1].finished == True
```

### Integration Testing
```bash
# Frontend Integration Test
pnpm test:e2e  # End-to-end tests

# API Integration Testing
pnpm test:integration  # API integration tests

# Full Stack Testing
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Build and Deployment

### Development Build
```bash
# Frontend development build with hot reload
cd frontend
pnpm dev  # http://localhost:5173

# Go backend development
cd backend/go
go run cmd/api/main.go  # http://localhost:8080

# Python backend development
cd backend/python
conda activate sj
python src/main.py  # http://localhost:8000
```

### Production Build
```bash
# Frontend production build
cd frontend
pnpm build  # Outputs to dist/

# Go backend build
cd backend/go
go build -o bin/aaanynotes ./cmd/api  # Cross-platform builds
# Python packaging
cd backend/python
python -m PyInstaller --onefile src/main.py  # Single executable
```

### Quality Assurance
```bash
# Frontend quality checks
cd frontend
pnpm lint          # ESLint checks
pnpm type-check    # TypeScript compilation
pnpm test          # Unit tests
pnpm build          # Production build test

# Go backend quality checks
cd backend/go
go fmt ./...        # Code formatting
go vet ./...        # Static analysis
go test ./...        # Unit tests
go build ./...       # Build verification
golint ./...         # Advanced linting

# Python backend quality checks
cd backend/python
black .              # Code formatting
flake8 .              # Style checking
pytest                 # Unit tests
mypy .                # Type checking
python -m build      # Package build
```

## Environment Management

### Development Environment Variables
```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
API_BASE_URL=http://localhost:8080
WS_URL=ws://localhost:8081
ENABLE_HOT_RELOAD=true
ENABLE_SOURCE_MAPS=true
```

### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info
API_BASE_URL=https://api.aaanynotes.com
ENABLE_COMPRESSION=true
ENABLE_MINIFICATION=true
```

## IDE Configuration

### VS Code Settings
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "go.useLanguageServer": true,
  "python.defaultInterpreterPath": "./backend/python/.venv/Scripts/python.exe",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.pytest_cache": true,
    "**/go.sum": false
  }
}
```

### Extensions
```json
// Recommended VS Code extensions
[
  "ms-vscode.vscode-typescript-next",
  "esbenp.prettier-vscode",
  "dbaeumer.vscode-eslint",
  "golang.go",
  "ms-python.python",
  "ms-vscode.vscode-json",
  "bradlc.vscode-tailwindcss"
]
```

## Debugging Tools

### Frontend Debugging
```typescript
// React DevTools integration
debugger;
console.log('Debug point reached');
// Network debugging with browser dev tools

// Error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Caught an error:', error, errorInfo);
  }
}
```

### Backend Debugging
```go
// Go debugging with delve
dlv debug cmd/api/main.go
// Logging with structured format
logger.WithFields(logrus.Fields{
    "service": "chat",
    "method": "stream",
    "user_id": userID,
}).Info("Processing chat request")
```

### Python Debugging
```python
# Python debugging with pdb
import pdb; pdb.set_trace()
# Logging with structured output
import structlog
logger = structlog.get_logger()
logger.info("Processing chat", model_id=model_id, user_id=user_id)
```

## Performance Monitoring

### Frontend Performance
```typescript
// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Performance:', entry.name, entry.duration);
  }
});
perfObserver.observe({ entryTypes: ['measure', 'navigation'] });

# Bundle analysis
pnpm build --analyze  # Webpack Bundle Analyzer
```

### Backend Performance
```bash
# Go profiling
go tool pprof http://localhost:8080/debug/pprof/
# Memory profiling
GOEXPERIMENT=1 go run cmd/api/main.go

# Python profiling
python -m cProfile -o profile.stats src/main.py
# Load testing
hey -n 1000 -c 10 http://localhost:8080/api/chat/stream
```

---

**This documentation provides a complete development workflow covering setup, coding, testing, building, and deployment for the full-stack AAAnyNotes application.**
