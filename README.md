# AAAnyNotes

Establish your knowledge base **Anytime**, **Anywhere**, and in **Any** way!

## 🏗️ AI AGENT WORKING RULES - MANDATORY

### CRITICAL WORKFLOW - MUST FOLLOW

**BEFORE ANY CODE WORK**:
1. ALWAYS read this README.md first - NO EXCEPTIONS
2. ALWAYS use the project structure to locate files
3. ALWAYS understand the technology stack before making changes

**AFTER ANY CODE WORK**:
1. ALWAYS verify all services still work together
2. NEVER break the three-tier architecture (Frontend → Go API → Python AI)
3. ALWAYS update documentation when making structural changes

### FORBIDDEN ACTIONS - DO NOT VIOLATE

**NEVER DO THESE**:
- NEVER modify ports 5173 (Frontend), 8080 (Go API), 8000 (Python AI)
- NEVER break the conda environment dependency ( sj for Python)
- NEVER change the startup scripts (start.bat, scripts/start-all.ps1)
- EVER introduce conflicting dependencies between services
- NEVER modify core architectural patterns without understanding all impacts

### DEVELOPMENT RULES

**MODULE-SPECIFIC WORK**:
- Frontend: React + TypeScript + Vite + Ant Design
- Go Backend: Gin framework, clean architecture
- Python Backend: FastAPI with async processing

**CROSS-MODULE WORK**:
- Understand the data flow: Frontend → Go API → Python AI → LLM
- Respect API contracts between services
- Maintain backward compatibility

## 📋 Project Overview

AAAnyNotes is a comprehensive note-taking web application designed for modern educational environments. It combines intelligent AI-powered features with robust knowledge management capabilities, creating an ecosystem that serves both educators and students.

Built with a polyglot architecture, the system leverages the best of modern web technologies to deliver a seamless, responsive experience for knowledge creation, organization, and collaboration.

## 🚀 Key Features

### 💻 Core Functionality
- **Smart Note Management**: Create, edit, and organize notes with rich text support
- **AI-Powered Chat**: Integrated large language model for intelligent content assistance
- **User Authentication**: Secure login system with JWT-based authorization
- **Real-time Updates**: Responsive UI with live data synchronization

### ⚙️ Technology Stack

#### Frontend
- **React 19** with TypeScript for type-safe development
- **Vite** for lightning-fast builds and development
- **Ant Design** for consistent, professional UI components
- **Real-time streaming** for AI chat interactions

#### Backend
- **Go API Server** (Gin framework) for high-performance HTTP services
- **Python FastAPI** service for AI model integration
- **SQLite/PostgreSQL** with GORM for data persistence
- **Streaming responses** for real-time AI interactions

### 🎯 User Experience
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern UI following best UX practices
- **Fast Performance**: Optimized for quick loading and smooth interactions

## 🏃 Quick Start

### Prerequisites
- **Node.js 18+** and **pnpm** for frontend development
- **Go 1.21+** for backend API
- **Python 3.9+** with **conda** environment sj GLM API Key** for AI functionality (optional for basic features)

### One-Click Startup (Windows)

For the fastest setup, simply run:

```bash
./start.bat
```

This will automatically:
1. Start the Go backend server (http://localhost:8080)
2. Launch the Python AI service (http://localhost:8000)
3. Run the React development server (http://localhost:5173)

All services open in separate terminal windows for easy monitoring.

### Manual Setup

If you prefer manual control over each service:

#### Frontend Development
```bash
cd frontend
pnpm install
pnpm dev      # Start development server on http://localhost:5173
pnpm build    # Build for production
pnpm lint     # Run ESLint
```

#### Go Backend API
```bash
cd backend/go
go run cmd/api/main.go    # Start API server on http://localhost:8080
go build ./...           # Build all packages
go test ./...             # Run tests
```

#### Python AI Service (CRITICAL - MUST USE CONDA ENV)
```bash
cd backend/python
conda activate sj         # MUST use sj conda environment
python src/main.py        # Start FastAPI server on http://localhost:8000
```

**⚠️ CRITICAL**: Python backend requires specific conda environment:
- Environment Path: `D:/Environments/Miniconda/envs/sj`
- Activation Command: `conda activate sj`
- Full Python Startup: `D:/Environments/Miniconda/envs/sj/python.exe src/main.py`

## 🏛️ Architecture

### System Flow
```
Frontend (5173) ↙ Go API (8080) ↙ Python AI (8000)
     ∣              ∣                ∣
  React UI     HTTP API        FastAPI + GLM
```

### Data Flow
1. **Authentication**: JWT tokens with refresh mechanism
2. **API Communication**: RESTful endpoints with async processing
3. **AI Integration**: Streaming responses for real-time chat
4. **Data Persistence**: GORM ORM with database abstraction

### Project Structure
```
AAAnynotes/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page-level components
│   │   ├── api/             # API client code
│   │   └── utils/           # Helper utilities
│   └── dist/                # Production build output
├── backend/
│   ├── go/                  # Go HTTP API server
│   │   ├── cmd/api/         # Application entry point
│   │   ├── internal/        # Private application code
│   │   └── infrastructure/  # External integrations
│   └── python/              # Python FastAPI AI service
│       ├── src/
│       │   ├── api/         # API endpoints
│       │   ├── models/      # Data models
│       │   ├── services/    # Business logic
│       │   └── config/      # Configuration
│       └── main.py          # Service entry point
├── config/                  # Configuration files
├── docs/                    # Project documentation
├── agentext/                # AI agent documentation
└── scripts/                 # Build and deployment scripts
```

## ⚙️ Configuration

### Database Configuration
- **Development**: Uses SQLite by default (no configuration needed)
- **Production**: Configure PostgreSQL connection in settings

## 🛠️ Development

### Code Quality
- **TypeScript**: Strict type checking for frontend code
- **Go fmt**: Automatic code formatting for Go code
- **ESLint**: JavaScript/TypeScript linting
- **Pydantic**: Data validation for Python APIs

### Testing
- **Go**: `go test ./...` for backend tests
- **Python**: pytest for FastAPI endpoint testing
- **Frontend**: React Testing Library for component tests

### Build & Deployment
- **Frontend**: `pnpm build` creates optimized production bundle
- **Go Backend**: `go build` creates standalone executable
- **Python Service**: Package as Docker container for deployment

## 📚 API Documentation

### Go API Endpoints
- `GET/POST /api/auth/*` - Authentication and user management
- `GET/POST /api/notes/*` - Note CRUD operations
- `GET/POST /api/chat/*` - AI chat integration

### Python AI Service
- `POST /api/chat/stream` - Streaming AI responses

## 🤝 Contributing

We welcome contributions! Please follow our development guidelines:

1. ALWAYS read this README.md first before making changes
2. Follow the existing code style and patterns
3. Add tests for new features
4. Update documentation for any API changes
5. Never break the three-service architecture

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Start discussions in GitHub Discussions
- **Documentation**: Check `agentext/` for detailed technical docs

## 🗺️ Future Roadmap

While the current implementation provides solid note-taking and AI chat functionality, we have exciting plans for the future:

- **Smart Classroom Integration**: Seamless LMS integration
- **Knowledge Graph Visualization**: Visual concept relationships
- **Real-time Collaboration**: Multi-user editing
- **Voice-Activated Notes**: Speech-to-text with AI categorization
- **Cross-Device Sync**: Seamless synchronization
- **Advanced AI Features**: Personalized learning paths

---

**AAAnyNotes** - Your intelligent knowledge companion for the modern learning journey.

*Built with ❤️ using React, Go, Python, and modern AI technologies*
