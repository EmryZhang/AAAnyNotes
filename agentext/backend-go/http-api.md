# Go HTTP API Context

## 1. Module Focus
This module provides context for implementing the Go HTTP API server that serves as the core backend for the AAAnynotes application. It handles all HTTP requests, manages business logic, performs database operations, and ensures data consistency. The API layer acts as the central hub between the frontend client, Python AI services, and the database.

## 2. File Locations
```
backend/go/
├── cmd/
│   └── api/
│       └── main.go           # Application entry point and server setup
├── internal/
│   ├── api/                 # HTTP handlers and route definitions
│   │   ├── handlers/        # Request handlers
│   │   │   ├── auth.go      # Authentication handlers
│   │   │   ├── notes.go     # Notes CRUD handlers
│   │   │   └── user.go      # User management handlers
│   │   └── routes.go        # Route definitions
│   ├── models/              # Data models and structs
│   │   ├── user.go          # User model
│   │   ├── note.go          # Note model
│   │   └── auth.go          # Authentication models
│   ├── services/            # Business logic layer
│   │   ├── auth_service.go  # Authentication logic
│   │   ├── note_service.go  # Notes business logic
│   │   └── user_service.go  # User management logic
│   ├── database/            # Database configuration and migrations
│   │   ├── connection.go    # DB connection setup
│   │   └── migrations/      # Database migrations
│   ├── middleware/          # HTTP middleware
│   │   ├── auth.go          # Authentication middleware
│   │   ├── cors.go          # CORS handling
│   │   └── logging.go       # Request logging
│   └── utils/               # Utility functions
│       ├── response.go      # Response helpers
│       └── validation.go    # Input validation
├── pkg/                     # Public library code
├── configs/                 # Configuration files
└── tests/                   # Test files
```

## 3. Feature Implementation
### Currently Implemented Features
- **RESTful API**: Standard HTTP methods for CRUD operations
- **Authentication**: JWT-based authentication with refresh tokens
- **Notes Management**: Full CRUD operations for notes
- **User Management**: User registration, login, profile management
- **Database Integration**: GORM for database operations
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Consistent error responses and logging
- **CORS Support**: Cross-origin resource sharing configuration
- **Middleware Pipeline**: Authentication, logging, CORS handling

### API Endpoints
- **Authentication**: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- **Users**: `/api/users/profile`, `/api/users/update`
- **Notes**: `/api/notes` (GET, POST, PUT, DELETE), `/api/notes/:id`
- **Health**: `/api/health` for service health checks

## 4. Technical Patterns
### Technologies Used
- **Go 1.21+**: Core programming language
- **Gin Framework**: HTTP web framework
- **GORM**: Object-relational mapping for database operations
- **SQLite/PostgreSQL**: Database backends
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing

### Coding Style & Patterns
- **Standard Go Formatting**: `go fmt` compliance
- **Package Organization**: Clean architecture with internal packages
- **Interface-Based Design**: Dependency injection using interfaces
- **Error Handling**: Explicit error returns with proper HTTP status codes
- **Middleware Pattern**: Request processing pipeline
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation

### Design Patterns
- **Clean Architecture**: Separation of concerns with layered approach
- **Dependency Injection**: Interface-based dependency management
- **Repository Pattern**: Data access layer abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Middleware Pattern**: Cross-cutting concerns handling
- **Factory Pattern**: Handler and service creation
- **Builder Pattern**: Response construction

### API Design Principles
- **RESTful Design**: Proper HTTP methods and status codes
- **JSON Responses**: Consistent JSON response format
- **Versioning**: API versioning through URL paths
- **Pagination**: List responses with pagination support
- **Validation**: Request validation with proper error messages
- **Security**: Input sanitization and SQL injection prevention
