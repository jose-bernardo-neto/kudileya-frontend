/**
 * Environment Configuration for Kudileya Chat Navigator
 * Centralizes access to environment variables with fallbacks
 */

interface AppConfig {
  // API Configuration
  api: {
    baseUrl: string;
    prodUrl: string;
    timeout: number;
    retryCount: number;
    cacheTime: number;
  };
  // Contact Information
  contact: {
    whatsappNumber: string;
    whatsappMessage: string;
    supportEmail: string;
    companyWebsite: string;
  };
  // Feature Flags
  features: {
    devMode: boolean;
    debugApi: boolean;
    enableWhatsapp: boolean;
    enableMap: boolean;
    enableDocuments: boolean;
    enableAnimations: boolean;
  };
  // UI Configuration
  ui: {
    defaultLanguage: 'pt' | 'en';
    defaultTheme: 'light' | 'dark';
    brandPrimaryColor: string;
    whatsappColor: string;
  };
  // Document Configuration
  documents: {
    maxFileSize: number;
    allowedFileTypes: string;
    docsPerPage: number;
  };
  // External Services
  services: {
    googleMapsApiKey?: string;
    analyticsId?: string;
  };
  // Security
  security: {
    apiRateLimit: number;
    forceHttps: boolean;
  };
  // Development
  dev: {
    showErrorDetails: boolean;
    enableDevtools: boolean;
    mockApi: boolean;
  };
}

// Helper function to parse boolean environment variables
const parseBoolean = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
};

// Helper function to parse number environment variables
const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Get API base URL based on environment
const getApiBaseUrl = (): string => {
  // In production or when PROD URL is explicitly set, use production URL
  if (import.meta.env.PROD || import.meta.env.VITE_USE_PROD_API === 'true') {
    return import.meta.env.VITE_API_PROD_URL || 'https://kudileya-app-backend.onrender.com';
  }
  // In development, use local URL
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

export const config: AppConfig = {
  // API Configuration
  api: {
    baseUrl: getApiBaseUrl(),
    prodUrl: import.meta.env.VITE_API_PROD_URL || 'https://kudileya-app-backend.onrender.com',
    timeout: parseNumber(import.meta.env.VITE_API_TIMEOUT, 10000),
    retryCount: parseNumber(import.meta.env.VITE_API_RETRY_COUNT, 2),
    cacheTime: parseNumber(import.meta.env.VITE_API_CACHE_TIME, 300000), // 5 minutes
  },

  // Contact Information
  contact: {
    whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '924643714',
    whatsappMessage: import.meta.env.VITE_WHATSAPP_MESSAGE || 'Olá! Gostaria de saber mais sobre os serviços da Kudileya.',
    supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'contato@kudileya.com',
    companyWebsite: import.meta.env.VITE_COMPANY_WEBSITE || 'https://kudileya.com',
  },

  // Feature Flags
  features: {
    devMode: parseBoolean(import.meta.env.VITE_DEV_MODE, import.meta.env.DEV),
    debugApi: parseBoolean(import.meta.env.VITE_DEBUG_API, import.meta.env.DEV),
    enableWhatsapp: parseBoolean(import.meta.env.VITE_ENABLE_WHATSAPP, true),
    enableMap: parseBoolean(import.meta.env.VITE_ENABLE_MAP, true),
    enableDocuments: parseBoolean(import.meta.env.VITE_ENABLE_DOCUMENTS, true),
    enableAnimations: parseBoolean(import.meta.env.VITE_ENABLE_ANIMATIONS, true),
  },

  // UI Configuration
  ui: {
    defaultLanguage: (import.meta.env.VITE_DEFAULT_LANGUAGE as 'pt' | 'en') || 'pt',
    defaultTheme: (import.meta.env.VITE_DEFAULT_THEME as 'light' | 'dark') || 'light',
    brandPrimaryColor: import.meta.env.VITE_BRAND_PRIMARY_COLOR || '#F0A22E',
    whatsappColor: import.meta.env.VITE_WHATSAPP_COLOR || '#25D366',
  },

  // Document Configuration
  documents: {
    maxFileSize: parseNumber(import.meta.env.VITE_MAX_FILE_SIZE, 50000000), // 50MB
    allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES || 'application/pdf',
    docsPerPage: parseNumber(import.meta.env.VITE_DOCS_PER_PAGE, 12),
  },

  // External Services
  services: {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  },

  // Security
  security: {
    apiRateLimit: parseNumber(import.meta.env.VITE_API_RATE_LIMIT, 60),
    forceHttps: parseBoolean(import.meta.env.VITE_FORCE_HTTPS, import.meta.env.PROD),
  },

  // Development
  dev: {
    showErrorDetails: parseBoolean(import.meta.env.VITE_SHOW_ERROR_DETAILS, import.meta.env.DEV),
    enableDevtools: parseBoolean(import.meta.env.VITE_ENABLE_DEVTOOLS, import.meta.env.DEV),
    mockApi: parseBoolean(import.meta.env.VITE_MOCK_API, false),
  },
};

// Helper functions for common operations
export const apiHelpers = {
  // Get full API URL for an endpoint
  getApiUrl: (endpoint: string): string => {
    const baseUrl = config.api.baseUrl.endsWith('/') 
      ? config.api.baseUrl.slice(0, -1) 
      : config.api.baseUrl;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
  },

  // Get WhatsApp URL
  getWhatsAppUrl: (customMessage?: string): string => {
    const message = customMessage || config.contact.whatsappMessage;
    return `https://wa.me/${config.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;
  },

  // Debug logging helper
  debugLog: (message: string, data?: any): void => {
    if (config.features.debugApi) {
      console.log(`[Kudileya Debug] ${message}`, data || '');
    }
  },

  // Error logging helper
  errorLog: (message: string, error?: any): void => {
    if (config.dev.showErrorDetails) {
      console.error(`[Kudileya Error] ${message}`, error || '');
    }
  },
};

// Export individual configurations for convenience
export const {
  api: apiConfig,
  contact: contactConfig,  
  features: featureFlags,
  ui: uiConfig,
  documents: documentsConfig,
  services: servicesConfig,
  security: securityConfig,
  dev: devConfig,
} = config;

export default config;