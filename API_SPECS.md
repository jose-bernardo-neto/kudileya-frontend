# Kudi Chat Navigator - API Specifications

## Frontend-Backend Integration

### Overview
This document describes the integration between the **Kudi Chat Navigator** (React/TypeScript frontend) and the **Kudileya App Backend** for the Enhanced Document Management System.

## Frontend Implementation: DocumentsUseful Component

### 📋 New Tab Integration
- **Location**: `/src/components/DocumentsUseful.tsx`
- **Navigation**: Added "Documentos Úteis" tab to the main navigation
- **Route**: Accessible via Layout navigation system
- **Icon**: FileText (Lucide React)

### 🎯 Features Implemented

#### Visual Document Cards
- **Responsive Grid**: 1-3 columns based on screen size
- **Category-based Thumbnails**: Visual PDF previews with category icons
- **Star Ratings**: Visual indication for useful documents (isUseful=true)
- **Rich Metadata Display**: Title, description, category, date, file size

#### Advanced Filtering System
- **Category Buttons**: Filter by 6 predefined categories
- **Search Functionality**: Real-time text search in title/description  
- **Useful Documents Priority**: Starred documents shown first
- **Results Counter**: Shows filtered vs total document counts

#### Download & Preview
- **Direct Download**: Streams PDF files via API endpoint
- **Preview Modal**: Shows document metadata and thumbnail
- **Progress Feedback**: Toast notifications for success/error states
- **File Naming**: Preserves original filenames on download

### 🔗 API Integration

#### Documents Endpoint
```typescript
// GET /api/documents - List all documents
interface DocumentMeta {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  title?: string;           // NEW: Custom document title
  description?: string;     // NEW: Document description  
  category?: string;        // NEW: Category classification
  thumbnail?: string;       // Reserved for future PDF thumbnails
  isUseful?: boolean;       // NEW: Useful document flag
}

// GET /api/documents/:id - Download specific document
// Returns: File stream with Content-Disposition header
```

#### React Query Integration
```typescript
const { data: documents, isLoading, error, refetch } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments,
  retry: 2,
  staleTime: 5 * 60 * 1000, // 5 minutes cache
});
```

### 🎨 UI/UX Implementation

#### Category System
```typescript
const categories = [
  { id: 'all', label: 'Todos', icon: '📁', color: 'bg-gray-100' },
  { id: 'leis', label: 'Leis e Códigos', icon: '📜', color: 'bg-blue-100' },
  { id: 'formularios', label: 'Formulários', icon: '📋', color: 'bg-green-100' },
  { id: 'manuais', label: 'Manuais e Guias', icon: '📖', color: 'bg-purple-100' },
  { id: 'contratos', label: 'Modelos de Contratos', icon: '📝', color: 'bg-orange-100' },
  { id: 'processos', label: 'Processos Judiciais', icon: '⚖️', color: 'bg-red-100' },
  { id: 'outros', label: 'Outros', icon: '📄', color: 'bg-yellow-100' },
];
```

#### Thumbnail Generation
```typescript
const generateThumbnail = (doc: DocumentMeta) => {
  const categoryInfo = getCategoryInfo(doc.category);
  return (
    <div className={`w-full h-24 ${categoryInfo.color} rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300`}>
      <div className="text-center">
        <div className="text-2xl mb-1">{categoryInfo.icon}</div>
        <div className="text-xs text-gray-600 font-medium">PDF</div>
      </div>
    </div>
  );
};
```

### 🌐 Internationalization
```typescript
// Portuguese (pt)
'documents.title': 'Documentos Úteis',
'documents.subtitle': 'Acesse e baixe documentos jurídicos importantes',
'documents.category.laws': 'Leis e Códigos',
'documents.search.placeholder': 'Pesquisar documentos...',

// English (en)  
'documents.title': 'Useful Documents',
'documents.subtitle': 'Access and download important legal documents',
'documents.category.laws': 'Laws & Codes',
'documents.search.placeholder': 'Search documents...',
```

### 📱 Navigation Integration

#### Layout.tsx Updates
```typescript
// Added FileText icon import
import { FileText } from 'lucide-react';

// Updated navigation items
const navItems = [
  { id: 'welcome', label: t('nav.welcome'), icon: Home },
  { id: 'faqs', label: t('nav.faqs'), icon: HelpCircle },
  { id: 'chat', label: t('nav.chat'), icon: MessageCircle },
  { id: 'documents', label: t('nav.documents'), icon: FileText }, // NEW
  { id: 'map', label: t('nav.map'), icon: MapPin },
];

// Updated interface types
interface LayoutProps {
  currentPage: 'welcome' | 'faqs' | 'chat' | 'map' | 'documents';
  onNavigate: (page: 'welcome' | 'faqs' | 'chat' | 'map' | 'documents') => void;
}
```

#### Index.tsx Updates  
```typescript
// Added DocumentsUseful import
import DocumentsUseful from '@/components/DocumentsUseful';

// Updated page routing
const renderCurrentPage = () => {
  switch (currentPage) {
    case 'welcome': return <Welcome onGetStarted={handleGetStarted} />;
    case 'faqs': return <FAQs onExplainWithAI={handleExplainWithAI} />;
    case 'chat': return <KudiChat initialQuestion={chatQuestion} />;
    case 'documents': return <DocumentsUseful />; // NEW
    case 'map': return <LawyersMap />;
    default: return <Welcome onGetStarted={handleGetStarted} />;
  }
};
```

## Backend Requirements

### API Endpoints
- **GET** `/api/documents` → Returns enhanced DocumentMeta array
- **GET** `/api/documents/:id` → Downloads PDF file with proper headers

### CORS Configuration
```typescript
// Required for frontend integration
app.register(cors, {
  origin: ['http://localhost:5173'], // Vite dev server
  credentials: true
});
```

### Enhanced Document Schema
```json
{
  "id": "uuid",
  "originalName": "documento.pdf", 
  "filename": "timestamp-documento.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "uploadedAt": "2026-02-09T10:00:00.000Z",
  "title": "Código Civil Angolano",           // NEW FIELD
  "description": "Texto oficial...",         // NEW FIELD  
  "category": "leis",                        // NEW FIELD
  "isUseful": true                           // NEW FIELD
}
```

## Error Handling

### Frontend Error States
```typescript
// API Connection Errors
if (error) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="text-center p-6">
        <div className="text-6xl mb-4">❌</div>
        <h3>{t('documents.error.title')}</h3>
        <p>{t('documents.error.description')}</p>
        <Button onClick={() => refetch()}>{t('documents.retry')}</Button>
      </CardContent>
    </Card>
  );
}

// Download Error Handling  
const handleDownload = async (doc: DocumentMeta) => {
  try {
    const response = await fetch(`http://localhost:3000/api/documents/${doc.id}`);
    if (!response.ok) throw new Error('Download failed');
    // ... download logic
    
    toast({
      title: t('documents.download.success'),
      description: `${doc.title} ${t('documents.download.completed')}`,
    });
  } catch (error) {
    toast({
      title: t('documents.download.error'),
      description: t('documents.download.failed'),
      variant: 'destructive',
    });
  }
};
```

## Performance Optimizations

### React Query Caching
- **5-minute stale time** for document list
- **Automatic background updates**
- **Retry logic** for failed requests

### Filtering Performance
```typescript
// Memoized filtering for large document lists
const filteredDocuments = React.useMemo(() => {
  let filtered = documents;
  
  // Category filtering
  if (selectedCategory !== 'all') {
    filtered = filtered.filter(doc => doc.category === selectedCategory);
  }
  
  // Search filtering  
  if (searchTerm) {
    const search = searchTerm.toLowerCase();
    filtered = filtered.filter(doc =>
      (doc.title || doc.originalName).toLowerCase().includes(search) ||
      (doc.description || '').toLowerCase().includes(search)
    );
  }
  
  // Sort useful documents first
  filtered.sort((a, b) => {
    if (a.isUseful && !b.isUseful) return -1;
    if (!a.isUseful && b.isUseful) return 1;
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
  
  return filtered;
}, [documents, selectedCategory, searchTerm]);
```

## Future Enhancements

### Planned Features
1. **Real PDF Thumbnails**: Generate actual PDF preview images
2. **In-browser PDF Viewer**: Modal with embedded PDF viewer
3. **Upload Interface**: Frontend document upload capability
4. **Advanced Search**: Full-text search within PDF content
5. **User Favorites**: Personal useful document collections
6. **Download Analytics**: Track popular documents
7. **Offline Support**: Cache frequently accessed documents

### Technical Improvements
1. **Virtual Scrolling**: Handle thousands of documents
2. **Progressive Loading**: Load documents as user scrolls  
3. **Search Debouncing**: Optimize search performance
4. **Image Optimization**: Compress and cache thumbnails
5. **Accessibility**: Screen reader support and keyboard navigation

---

# Backend Documentation

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Set OpenRouter API key in environment (optional for `/api/ask`)

```bash
set OPENROUTER_API_KEY=your_key_here   # Windows
export OPENROUTER_API_KEY=your_key_here # Unix
```

3. Run in development

```bash
npm run dev
```

4. **Access Services**:
   - 🌐 **Web Client**: http://localhost:3000
   - 📚 **API Documentation**: http://localhost:3000/docs (Swagger UI)

## Features

### 📖 API Documentation (Swagger)
- **Interactive Documentation**: Complete Swagger UI at `/docs`
- **Try It Out**: Test all endpoints directly from the browser
- **Schema Validation**: Request/response models documented
- **OpenAPI 3.0**: Standards-compliant API specification

### Web Client
- ✨ Modern UI with HTMX, Alpine.js and TailwindCSS
- 🤖 Ask legal questions to Kudileya AI
- ❓ Browse and add FAQs by category  
- 📄 Upload and download PDF documents with enhanced features
- 🏷️ Document categorization and metadata management
- 🔍 Document filtering by categories
- 📱 Responsive design with modern card-based layout

### 📋 Enhanced Document Management
- **📤 Rich Upload Form**: Title, description, category selection
- **🏷️ Document Categories**: Laws, Forms, Manuals, Contracts, Processes
- **⭐ Useful Documents**: Mark important documents with star rating
- **🎨 Visual Thumbnails**: Auto-generated category-based document previews
- **🔍 Smart Filtering**: Filter documents by category with intuitive buttons
- **📊 Enhanced Metadata**: File size, upload date, and custom descriptions
- **💾 Structured Storage**: Organized metadata with category-based grouping

### API Endpoints

#### 📄 Documents
- **POST** `/api/documents` → multipart form with enhanced fields:
  - `file` (required): PDF file
  - `title` (required): Custom document title  
  - `category` (required): Document category (leis, formularios, manuais, contratos, processos, outros)
  - `description` (optional): Document description
  - `isUseful` (optional): Mark as useful document
- **GET** `/api/documents` → list all documents with metadata
- **GET** `/api/documents/:id` → download specific document

#### ❓ FAQs  
- **POST** `/api/faqs` → body: `{ question, answer, category? }`
- **GET** `/api/faqs` → returns FAQs grouped by category

#### 🤖 AI Assistant
- **POST** `/api/ask` → body: `{ prompt, model? }` (requires `OPENROUTER_API_KEY`)

## Project Structure

```
src/
├── services/       # Business logic (DocumentService, FAQService)
├── routes/         # API routes (documents, faqs, ask)
├── types.ts        # TypeScript interfaces with enhanced DocumentMeta
└── index.ts        # Server entry point

public/
└── index.html      # Enhanced web client with document management UI

tests/
├── services/       # Service unit tests
└── routes/         # Route unit tests

data/
├── documents.json  # Enhanced document metadata storage
└── faqs.json       # FAQ storage

files/docs/         # PDF document storage directory
```

## Document Schema

```typescript
interface DocumentMeta {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  title?: string;        // Custom document title
  description?: string;  // Document description
  category?: string;     // Document category
  thumbnail?: string;    // Future: thumbnail URL
  isUseful?: boolean;    // Useful document flag
}
```

## Development

```bash
# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Enhanced UI Features

### 🎨 Document Cards
- **Visual Thumbnails**: Category-based icons with gradient backgrounds
- **Rich Metadata**: Title, description, category, file size, upload date
- **Star Rating**: Visual indication of useful documents
- **Responsive Grid**: 1-3 columns based on screen size

### 🔍 Category Filtering
- **Interactive Buttons**: One-click category filtering
- **Visual Feedback**: Active category highlighting
- **Real-time Updates**: Instant filtering without page reload

### 📤 Enhanced Upload
- **Multi-field Form**: Title, category, description inputs
- **Input Validation**: Required fields and file type checking
- **Success Feedback**: Visual confirmation with document details

## Notes

- This project uses Fastify with CORS enabled for development
- Static files are served from `/public` directory
- Enhanced metadata is stored in `data/documents.json` with backward compatibility
- File uploads go to `files/docs/` directory with timestamped filenames
- **Swagger Documentation** available at `/docs` endpoint with updated schemas
- Document categories provide structured organization for legal documents
- UI supports both useful document highlights and category-based organization
