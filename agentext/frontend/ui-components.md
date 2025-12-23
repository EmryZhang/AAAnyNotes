# Frontend UI Components Documentation

## Module Overview
The frontend is a React + TypeScript application with Vite build system and Ant Design components, providing an intuitive user interface for the AAAnyNotes knowledge garden.

## Architecture
```
Component Layer ¡ú State Management ¡ú API Service ¡ú HTTP/gRPC ¡ú Backend
```

## File Structure
```
frontend/
©À©¤©¤ src/
©¦   ©À©¤©¤ components/              # Reusable UI components
©¦   ©¦   ©À©¤©¤ chat/            # Chat interface components
©¦   ©¦   ©¦   ©¸©¤©¤ AIChatInterface.tsx  # Main chat component
©¦   ©¦   ©À©¤©¤ layout/          # Layout components
©¦   ©¦   ©¦   ©À©¤©¤ CardGrid.tsx         # Card grid display
©¦   ©¦   ©¦   ©À©¤©¤ Header.tsx            # App header
©¦   ©¦   ©¦   ©¸©¤©¤ Sidebar.tsx          # Collapsible sidebar
©¦   ©¦   ©¸©¤©¤ Card.tsx            # Individual note card
©¦   ©À©¤©¤ context/                # React contexts
©¦   ©¦   ©¸©¤©¤ AuthContext.tsx    # Authentication context
©¦   ©À©¤©¤ types/                  # TypeScript type definitions
©¦   ©¦   ©À©¤©¤ auth.ts           # Auth-related types
©¦   ©¦   ©¸©¤©¤ chat.ts           # Chat message types
©¦   ©À©¤©¤ api/                    # API service layer
©¦   ©¦   ©¸©¤©¤ chat.ts          # Chat API functions
©¦   ©¸©¤©¤ services/               # Service layer
©¦       ©¸©¤©¤ modelService.ts  # Model management
©À©¤©¤ public/                   # Static assets
©À©¤©¤ dist/                     # Production build output
©¸©¤©¤ package.json              # Dependencies and scripts
```

## Key Components

### Chat Interface (`components/chat/`)
**Purpose**: AI-powered conversation interface with streaming responses
**Files**:
- `AIChatInterface.tsx`: Main chat component with model selection
**Keywords**: chat, AI interface, conversation, message, streaming

### Layout Components (`components/layout/`)
**Purpose**: Application layout and navigation
**Files**:
- `Header.tsx`: Top navigation with menu and user profile
- `Sidebar.tsx`: Collapsible navigation sidebar
- `CardGrid.tsx`: Grid layout for note cards
- `Card.tsx`: Individual note card component
**Keywords**: layout, navigation, card, grid, responsive

### State Management (`context/`)
**Purpose**: Global state and context management
**Files**:
- `AuthContext.tsx`: Authentication state and user session
**Keywords**: context, state, authentication, session

### Type Definitions (`types/`)
**Purpose**: TypeScript interfaces and type safety
**Files**:
- `auth.ts`: Authentication-related types
- `chat.ts`: Chat message and streaming types
**Keywords**: types, interface, TypeScript, validation

### API Services (`api/`)
**Purpose**: HTTP client and API integration
**Files**:
- `chat.ts`: Chat API functions with streaming support
**Keywords**: API, HTTP, streaming, service

### Service Layer (`services/`)
**Purpose**: Business logic and data management
**Files**:
- `modelService.ts`: Model loading and configuration
**Keywords**: service, state, model, configuration

## Core Features

### AI Chat Integration
- Multi-model selection with dropdown
- Real-time streaming responses
- Error handling and retry mechanisms
- Copy, regenerate, and like functionality
- Responsive design for mobile and desktop

### Model Management
- Dynamic model loading from backend
- Default model selection (currently Kimi K2 Turbo)
- Model capability detection
- Support for thinking mode models

### UI/UX Features
- Ant Design component library integration
- Responsive grid layout for note cards
- Collapsible sidebar with mouse interactions
- Loading states and error boundaries
- TypeScript strict mode for type safety

## Development Guidelines

### Code Style (Following AGENTS.md)
- ALL code comments MUST be in English
- ALL debug output MUST use English text
- ALL log messages MUST be in English
- Variable names: English only (new ones)
- Use React functional components and hooks
- Follow Ant Design component patterns

### Component Patterns
```tsx
// Functional component with hooks
export default function AIChatInterface({
  visible,
  onVisibleChange,
  modelsReady
}: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Component logic
  return (
    <div>
      {/* JSX content */}
    </div>
  );
}
```

### TypeScript Patterns
```typescript
// Interface definitions
interface ChatStreamRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  maxTokens?: number;
}

// Type-safe API calls
export async function sendChatStream(
  params: ChatStreamParams,
  signal: AbortSignal,
  onChunk: (content: string, finished: boolean) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> {
  // Implementation
}
```

## Technology Stack
- **Framework**: React 19.2.0 with TypeScript strict mode
- **Build System**: Vite with hot reload
- **UI Library**: Ant Design components
- **Styling**: Inline styles with responsive design
- **State Management**: React Context API with hooks
- **Type Safety**: Strict TypeScript configuration

## Performance Optimizations

### Component Rendering
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable function references
- Code splitting with lazy loading

### Data Management
- Efficient API request handling with AbortController
- Streaming response processing with backpressure handling
- Model service caching for performance
- Optimistic UI updates for better UX

### Bundle Optimization
- Vite build optimizations
- Tree shaking for unused code
- Dynamic imports for large dependencies
- Asset compression and CDN optimization

## Testing Guidelines

### Component Testing
```typescript
// React Testing Library pattern
import { render, screen, fireEvent } from '@testing-library/react';
import AIChatInterface from './AIChatInterface';

test('renders chat interface', () => {
  render(<AIChatInterface visible={true} />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### API Testing
```typescript
// Mock API responses
import { sendChatStream } from '../api/chat';

jest.mock('../api/chat');
test('handles streaming responses', async () => {
  const mockStream = jest.fn();
  await sendChatStream(mockParams, mockSignal, mockCallback);
  expect(mockStream).toHaveBeenCalled();
});
```

## Configuration

### Environment Setup
```typescript
// Environment variables support
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const CHAT_WS_URL = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:8081';
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'antd'],
          chat: ['./src/components/chat']
        }
      }
    }
  }
});
```

## Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  mobile: '576px',
  tablet: '768px',
  desktop: '992px',
  large: '1200px'
};
```

### Layout Patterns
```tsx
// Responsive grid layout
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '20px',
  padding: '20px'
}}>
  <Card {...cardProps} />
</div>
```

---

**This documentation covers the complete frontend React application, including component architecture, development patterns, and best practices.**
