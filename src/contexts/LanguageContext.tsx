import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // KudiChat
    'kudichat.title': 'KudiChat',
    'kudichat.subtitle': 'Assistente IA da Kudileya',
    'kudichat.welcome.title': 'Olá! Como posso ajudar?',
    'kudichat.welcome.description': 'Faça qualquer pergunta sobre a Kudileya ou nossos serviços de IA',
    'kudichat.placeholder': 'Digite sua mensagem...',
    'kudichat.send': 'Enviar',
    'kudichat.clear': 'Limpar chat',
    'kudichat.cleared': 'Conversa limpa',
    'kudichat.cleared.description': 'Histórico de mensagens foi removido.',
    'kudichat.error.title': 'Erro de conexão',
    'kudichat.error.description': 'Não foi possível conectar com o servidor. Tente novamente.',
    'kudichat.fallback': 'Olá! Sou o assistente da Kudileya. Obrigado por sua pergunta: "{question}". No momento estou enfrentando dificuldades para processar sua pergunta. Tente novamente em alguns instantes.',
    'kudichat.listen': 'Ouvir',
    'kudichat.listening': 'Ouvindo...',
    'kudichat.speak': 'Falar resposta',
    'kudichat.stop.speaking': 'Parar fala',
    'kudichat.speech.not.supported': 'Reconhecimento de voz não suportado',
    'kudichat.tts.not.supported': 'Síntese de voz não suportada',
    
    // Navigation
    'nav.welcome': 'Início',
    'nav.faqs': 'FAQ',
    'nav.chat': 'KudiChat',
    'nav.map': 'Mapa',
    'nav.documents': 'Documentos',
    
    // Documents
    'documents.title': 'Documentos Úteis',
    'documents.subtitle': 'Acesse e baixe documentos jurídicos importantes',
    'documents.category.all': 'Todos',
    'documents.category.laws': 'Leis e Códigos',
    'documents.category.forms': 'Formulários',
    'documents.category.manuals': 'Manuais e Guias',
    'documents.category.contracts': 'Modelos de Contratos',
    'documents.category.processes': 'Processos Judiciais',
    'documents.category.others': 'Outros',
    'documents.search.placeholder': 'Pesquisar documentos...',
    'documents.refresh': 'Atualizar',
    'documents.download': 'Download',
    'documents.download.success': 'Download concluído',
    'documents.download.completed': 'foi baixado com sucesso',
    'documents.download.error': 'Erro no download',
    'documents.download.failed': 'Falha ao baixar o documento',
    'documents.preview.title': 'Visualizar Documento',
    'documents.empty.title': 'Nenhum documento encontrado',
    'documents.empty.description': 'Não há documentos disponíveis no momento',
    'documents.results.showing': 'Mostrando',
    'documents.results.of': 'de',
    'documents.results.documents': 'documentos',
    'documents.error.title': 'Erro ao carregar documentos',
    'documents.error.description': 'Não foi possível conectar ao servidor',
    'documents.retry': 'Tentar novamente',
    
    // Map
    'map.loading': 'Carregando mapa...',
    'map.apiKeyRequired': 'Chave da API do Google Maps necessária',
    'map.court': 'Tribunal',
    'map.lawFirm': 'Escritório de Advocacia',
    'map.legend': 'Legenda',
    'map.courts': 'Tribunais',
    'map.lawFirms': 'Escritórios de Advocacia',
    'map.specialties': 'Especialidades',
    
    // General
    'language.portuguese': 'Português',
    'language.english': 'English',
  },
  en: {
    // KudiChat
    'kudichat.title': 'KudiChat',
    'kudichat.subtitle': 'Kudileya AI Assistant',
    'kudichat.welcome.title': 'Hello! How can I help?',
    'kudichat.welcome.description': 'Ask any question about Kudileya or our AI services',
    'kudichat.placeholder': 'Type your message...',
    'kudichat.send': 'Send',
    'kudichat.clear': 'Clear chat',
    'kudichat.cleared': 'Chat cleared',
    'kudichat.cleared.description': 'Message history has been removed.',
    'kudichat.error.title': 'Connection error',
    'kudichat.error.description': 'Could not connect to server. Please try again.',
    'kudichat.fallback': 'Hello! I am Kudileya\'s assistant. Thank you for your question: "{question}". I am currently having difficulties processing your question. Please try again in a few moments.',
    'kudichat.listen': 'Listen',
    'kudichat.listening': 'Listening...',
    'kudichat.speak': 'Speak response',
    'kudichat.stop.speaking': 'Stop speaking',
    'kudichat.speech.not.supported': 'Speech recognition not supported',
    'kudichat.tts.not.supported': 'Text-to-speech not supported',
    
    // Navigation
    'nav.welcome': 'Home',
    'nav.faqs': 'FAQ',
    'nav.chat': 'KudiChat',
    'nav.map': 'Map',
    'nav.documents': 'Documents',
    
    // Documents
    'documents.title': 'Useful Documents',
    'documents.subtitle': 'Access and download important legal documents',
    'documents.category.all': 'All',
    'documents.category.laws': 'Laws & Codes',
    'documents.category.forms': 'Forms',
    'documents.category.manuals': 'Manuals & Guides',
    'documents.category.contracts': 'Contract Templates',
    'documents.category.processes': 'Legal Processes',
    'documents.category.others': 'Others',
    'documents.search.placeholder': 'Search documents...',
    'documents.refresh': 'Refresh',
    'documents.download': 'Download',
    'documents.download.success': 'Download completed',
    'documents.download.completed': 'downloaded successfully',
    'documents.download.error': 'Download error',
    'documents.download.failed': 'Failed to download document',
    'documents.preview.title': 'Document Preview',
    'documents.empty.title': 'No documents found',
    'documents.empty.description': 'No documents are currently available',
    'documents.results.showing': 'Showing',
    'documents.results.of': 'of',
    'documents.results.documents': 'documents',
    'documents.error.title': 'Error loading documents',
    'documents.error.description': 'Could not connect to server',
    'documents.retry': 'Try again',
    
    // Map
    'map.loading': 'Loading map...',
    'map.apiKeyRequired': 'Google Maps API key required',
    'map.court': 'Court',
    'map.lawFirm': 'Law Firm',
    'map.legend': 'Legend',
    'map.courts': 'Courts',
    'map.lawFirms': 'Law Firms',
    'map.specialties': 'Specialties',
    
    // General
    'language.portuguese': 'Português',
    'language.english': 'English',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kudileya-language');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('kudileya-language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};