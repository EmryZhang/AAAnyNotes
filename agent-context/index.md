# AAAnynotes Project Overview

## Vision & Purpose

### Project Background
AAAnynotes is a note-taking web application designed to solve core problems in knowledge transfer, consolidation, processing, and collaboration between teachers and students. The system uses knowledge cards as core carrier, integrates large model intelligent technology, and creates a comprehensive knowledge management platform specifically designed for smart classroom scenarios. It meets the needs of teachers for teaching resource creation, distribution, and review, while also adapting to students needs for note organization, knowledge point optimization, and collaborative learning, helping to build an efficient, interactive, and personalized smart teaching ecosystem.

### Core Philosophy
- Knowledge Card-based: Transform fragmented knowledge into structured units
- AI-powered Processing: Use LLM for content optimization and recommendations
- Scenario-specific Design: Customized for smart classroom needs
- Dual-empowerment: Serve both teaching and learning requirements

### System Goals
1. Provide convenient knowledge card lifecycle management with rich text editing, categorization, and retrieval.
2. Integrate LLM for content summarization, structured formatting, multi-card synthesis, and intelligent Q&A.
3. Support diverse content input and export methods to meet multi-scenario data interaction requirements.
4. Build a tiered user system providing collaboration and sharing for advanced users, while ensuring compliance operations and API management through admin backend.
5. Ensure system data security with backup and exception handling mechanisms.

### System Scope

#### Inclusion Scope

1. User-side Functions: Knowledge card management (create, edit, categorize), LLM integration (single/multi-card processing, content Q&A), content input/export (voice, document upload, PDF export), sharing and collaboration (advanced users), search, data backup, notifications.

2. Admin Backend Functions: Card management and monitoring, content moderation, communication log viewing, API key management, traffic monitoring, billing management.

3. Core Components: User system module, knowledge card module, LLM agent module, collaboration module, admin module, data storage and backup module.

#### Exclusion Scope

1. Complex PDF Processing: Deep parsing of complex PDFs (encrypted, 3D models, dynamic forms).

2. Third-party Social Integration: Direct login and content sync with social platforms.

3. LLM Development: Underlying algorithm development and training (only leveraging existing LLM capabilities).

4. Offline LLM Integration: LLM integration functionality in offline state.

### Future Vision - Not Yet Implemented
- Smart Classroom Integration: Seamless integration with classroom teaching systems
- Personalized Learning Paths: AI-driven personalized content recommendations
- Real-time Collaboration: Multi-user collaborative note-taking and discussion
- Knowledge Graph Visualization: Visual representation of concept relationships
- Teaching Analytics Dashboard: Comprehensive learning analytics for educators
- Cross-device Synchronization: Seamless sync across all learning devices
- Voice-activated Notes: Speech-to-text with intelligent categorization
- Adaptive Assessment: Dynamic quiz generation based on learning progress

## Current Implementation

### Core Architecture
Full-stack notes application with AI chat integration:
- Frontend: React + TypeScript + Vite + Ant Design
- Backend: Go (Gin) HTTP API + Python (FastAPI) AI service
- Database: GORM with SQLite/PostgreSQL
- Deployment: One-click startup with conda environment

### System Flow
1. Frontend (port 5173) to Go API (port 8080) to Python AI (port 8000)
2. Auth flow: JWT tokens with refresh mechanism
3. Data flow: RESTful APIs with async Python processing

### Implemented Features - What Currently Works
- User authentication and management
- Notes CRUD operations
- AI-powered chat functionality
- Responsive UI with real-time updates

## Technology Principles
- Go: Clean architecture, dependency injection, middleware pipeline
- Python: Async FastAPI, Pydantic validation, streaming responses
- React: Functional components, TypeScript safety, Ant Design consistency

## Development Commands
- start.bat / scripts/start-all.ps1 for all services
- Frontend: pnpm dev/build/lint
- Go: go run cmd/api/main.go
- Python: conda activate sj && python src/main.py

## AI AGENT WORKING RULES

### MANDATORY WORKFLOW - MUST FOLLOW

**BEFORE ANY CODE WORK**:
1. ALWAYS read this index.md first - NO EXCEPTIONS
2. ALWAYS use router.md to locate module documentation
3. ALWAYS read the target module MD before coding

**AFTER ANY CODE WORK**:
1. ALWAYS check all affected MD files for consistency
2. NEVER leave documentation outdated - IMMEDIATE UPDATE REQUIRED
3. ALWAYS verify that code changes match documented patterns

### FORBIDDEN ACTIONS - DO NOT VIOLATE

**NEVER DO THESE**:
- NEVER skip reading index.md - ALWAYS START HERE
- NEVER ignore router.md for file locations
- NEVER write code without reading module MD first
- NEVER create files without updating relevant MD
- NEVER modify APIs without updating documentation
- NEVER change patterns without updating MD content
- NEVER leave inconsistencies between code and docs

### CONTEXT LOADING RULES

**MODULE-SPECIFIC WORK**:
MUST load: index.md + router.md + [target module].md

**CROSS-MODULE WORK**:
MUST load: index.md + all relevant module MDs

**ARCHITECTURAL QUESTIONS**:
MUST load: index.md ONLY

### DOCUMENTATION UPDATES - IMMEDIATE REQUIREMENTS

**UPDATE MD WHEN**:
- New files are created
- APIs are added/modified
- File locations change
- New patterns are introduced
- Dependencies are updated
- Functionality changes

**NO DELAYS**: Update documentation immediately after code changes - NOT LATER

### CONSISTENCY ENFORCEMENT

**ALWAYS VERIFY**:
- Code matches documented patterns
- File locations are accurate in MDs
- API endpoints are correctly documented
- Technology choices are reflected in docs
- No contradictions between different MD files

**IF INCONSISTENCY FOUND**: Fix immediately before proceeding

### LANGUAGE REQUIREMENT

**ALL AGENT-CONTEXT DOCUMENTATION MUST BE IN ENGLISH**:
- MANDATORY: All MD files must use English only
- FORBIDDEN: No Chinese characters in documentation
- PURPOSE: Ensure consistent AI model understanding
- EXCEPTION: Project names may retain original form
