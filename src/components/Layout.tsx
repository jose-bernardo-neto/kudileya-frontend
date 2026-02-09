
import React from 'react';
import { Menu, X, MessageCircle, HelpCircle, Home, Sun, Moon, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

// WhatsApp icon component
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.473 3.516z"/>
  </svg>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'welcome' | 'faqs' | 'chat' | 'map';
  onNavigate: (page: 'welcome' | 'faqs' | 'chat' | 'map') => void;
}

const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const navItems = [
    { id: 'welcome' as const, label: t('nav.welcome'), icon: Home },
    { id: 'faqs' as const, label: t('nav.faqs'), icon: HelpCircle },
    { id: 'chat' as const, label: t('nav.chat'), icon: MessageCircle },
    { id: 'map' as const, label: t('nav.map'), icon: MapPin },
  ];


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Native Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 orange-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Kudileya
              </span>
            </div>

            {/* Language Selector, Maps, Theme toggle and mobile menu */}
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('map')}
                className="text-foreground hover:bg-accent"
                title={t('nav.map')}
              >
                <MapPin size={20} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-foreground hover:bg-accent"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="bg-card border-t border-border animate-fade-in">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full justify-start flex items-center space-x-2 ${
                      currentPage === item.id 
                        ? 'orange-gradient text-white' 
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-background">
        {children}
      </main>

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <a
          href="https://wa.me/924643714"
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20c55a] shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
          title="Contatar via WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      </div>

      {/* Bottom Navigation (Native Mobile Style) */}
      <nav className="bg-card border-t border-border px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center space-y-1 p-2 ${
                  currentPage === item.id 
                    ? 'text-[#F0A22E]' 
                    : 'text-muted-foreground'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
