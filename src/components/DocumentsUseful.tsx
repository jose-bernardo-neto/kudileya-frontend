import React from 'react';
import { Download, Eye, Calendar, FileText, Search, Filter, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { apiHelpers, apiConfig } from '@/lib/config';

interface DocumentMeta {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  title?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  isUseful?: boolean;
}

const DocumentsUseful = () => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDocument, setSelectedDocument] = React.useState<DocumentMeta | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Fetch documents from the API
  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['documents'],
    queryFn: async (): Promise<DocumentMeta[]> => {
      apiHelpers.debugLog('Fetching documents from API...');
      const response = await fetch(apiHelpers.getApiUrl('/api/documents'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      apiHelpers.debugLog('Documents received from API:', data);
      return data;
    },
    retry: apiConfig.retryCount,
    staleTime: apiConfig.cacheTime,
  });

  // Category definitions
  const categories = [
    { id: 'all', label: t('documents.category.all'), icon: '📁', color: 'bg-gray-100' },
    { id: 'leis', label: t('documents.category.laws'), icon: '📜', color: 'bg-blue-100' },
    { id: 'formularios', label: t('documents.category.forms'), icon: '📋', color: 'bg-green-100' },
    { id: 'manuais', label: t('documents.category.manuals'), icon: '📖', color: 'bg-purple-100' },
    { id: 'contratos', label: t('documents.category.contracts'), icon: '📝', color: 'bg-orange-100' },
    { id: 'processos', label: t('documents.category.processes'), icon: '⚖️', color: 'bg-red-100' },
    { id: 'outros', label: t('documents.category.others'), icon: '📄', color: 'bg-yellow-100' },
  ];

  // Filter documents based on category and search term
  const filteredDocuments = React.useMemo(() => {
    let filtered = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by search term
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

  const getCategoryInfo = (categoryId?: string) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'outros')!;
  };

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

  const handleDownload = async (doc: DocumentMeta) => {
    try {
      const response = await fetch(apiHelpers.getApiUrl(`/api/documents/${doc.id}`));
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = doc.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: t('documents.download.success'),
        description: `${doc.title || doc.originalName} ${t('documents.download.completed')}`,
      });
    } catch (error) {
      apiHelpers.errorLog('Download failed:', error);
      toast({
        title: t('documents.download.error'),
        description: t('documents.download.failed'),
        variant: 'destructive',
      });
    }
  };

  const handlePreview = (doc: DocumentMeta) => {
    setSelectedDocument(doc);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">{t('documents.error.title')}</h3>
            <p className="text-gray-600 mb-4">{t('documents.error.description')}</p>
            <Button onClick={() => refetch()}>{t('documents.retry')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <FileText className="text-[#F0A22E]" size={40} />
            {t('documents.title')}
          </h1>
          <p className="text-muted-foreground">{t('documents.subtitle')}</p>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder={t('documents.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-1 ${
                      selectedCategory === category.id ? 'bg-[#F0A22E] text-white' : ''
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="hidden sm:inline">{category.label}</span>
                  </Button>
                ))}
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="whitespace-nowrap"
              >
                🔄 {t('documents.refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="bg-gray-200 rounded-lg h-24 mb-4"></div>
                  <div className="bg-gray-200 rounded h-4 mb-2"></div>
                  <div className="bg-gray-200 rounded h-3 w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Documents Grid */}
        {!isLoading && (
          <>
            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-xl font-semibold mb-2">{t('documents.empty.title')}</h3>
                  <p className="text-muted-foreground">{t('documents.empty.description')}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((document) => {
                  const categoryInfo = getCategoryInfo(document.category);
                  return (
                    <Card key={document.id} className="hover:shadow-lg transition-all duration-300 border border-border">
                      <CardContent className="p-4">
                        {/* Thumbnail */}
                        <div className="mb-4">
                          {generateThumbnail(document)}
                        </div>

                        {/* Document Info */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-foreground text-sm leading-tight line-clamp-2 flex-1">
                            {document.title || document.originalName}
                          </h3>
                          {document.isUseful && (
                            <Star className="pl-2 text-yellow-500 fill-yellow-500" size={20} />
                          )}
                        </div>

                        {document.description && (
                          <p className="text-muted-foreground text-xs mb-3 line-clamp-2">
                            {document.description}
                          </p>
                        )}

                        {/* Category Badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary" className={`text-xs ${categoryInfo.color} border-none`}>
                            {categoryInfo.icon} {categoryInfo.label}
                          </Badge>
                        </div>

                        {/* Metadata */}
                        <div className="text-xs text-muted-foreground mb-4 space-y-1">
                          <div className="flex justify-between">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(document.uploadedAt)}
                            </span>
                            <span>💾 {formatFileSize(document.size)}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDownload(document)}
                            className="flex-1 bg-[#F0A22E] hover:bg-[#E09515] text-white text-xs"
                            size="sm"
                          >
                            <Download size={14} className="mr-1" />
                            {t('documents.download')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(document)}
                            className="px-3"
                          >
                            <Eye size={14} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Results Summary */}
            {filteredDocuments.length > 0 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {t('documents.results.showing')} {filteredDocuments.length} {t('documents.results.of')} {documents.length} {t('documents.results.documents')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview Modal - Simple implementation */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('documents.preview.title')}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>{generateThumbnail(selectedDocument)}</div>
              <div>
                <h4 className="font-semibold">{selectedDocument.title || selectedDocument.originalName}</h4>
                {selectedDocument.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedDocument.description}</p>
                )}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>📅 {formatDate(selectedDocument.uploadedAt)}</span>
                <span>💾 {formatFileSize(selectedDocument.size)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedDocument)}
                  className="flex-1 bg-[#F0A22E] hover:bg-[#E09515] text-white"
                >
                  <Download size={16} className="mr-2" />
                  {t('documents.download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentsUseful;
