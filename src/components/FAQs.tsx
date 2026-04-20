import React from 'react';
import { ChevronDown, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useQuery } from '@tanstack/react-query';
import { apiHelpers, apiConfig } from '@/lib/config';

interface FAQsProps {
  onExplainWithAI: (question: string) => void;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}

interface FAQsResponse {
  data: FAQ[];
  next_cursor: string | null;
  has_more: boolean;
}

interface GroupedFAQs {
  [topic: string]: FAQ[];
}

const FAQs = ({ onExplainWithAI }: FAQsProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // Fetch FAQs from API
  const { data: faqsResponse, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<FAQsResponse> => {
      apiHelpers.debugLog('Fetching FAQs from API...');
      const response = await fetch(apiHelpers.getApiUrl('/api/v1/faqs'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      apiHelpers.debugLog('FAQs received from API:', data);
      return data;
    },
    retry: apiConfig.retryCount,
    staleTime: apiConfig.cacheTime,
  });

  // Group FAQs by topic
  const groupedFAQs = React.useMemo((): GroupedFAQs => {
    if (!faqsResponse?.data || faqsResponse.data.length === 0) {
      return {};
    }

    return faqsResponse.data.reduce((acc, faq) => {
      const topic = faq.topic || 'Outros';
      if (!acc[topic]) {
        acc[topic] = [];
      }
      acc[topic].push(faq);
      return acc;
    }, {} as GroupedFAQs);
  }, [faqsResponse]);

  const topics = Object.keys(groupedFAQs);
  const totalFAQs = faqsResponse?.data?.length || 0;

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Capitalize first letter of topic
  const formatTopicName = (topic: string) => {
    return topic.charAt(0).toUpperCase() + topic.slice(1);
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#F0A22E]">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre direitos e legislação
          </p>
          {isLoading && (
            <p className="text-sm text-muted-foreground mt-2">
              Carregando perguntas mais recentes...
            </p>
          )}
          {error && (
            <div className="mt-4">
              <Card className="border-red-200 bg-red-50">
                <div className="p-4 text-center">
                  <p className="text-sm text-red-600 mb-2">
                    Não foi possível carregar as perguntas frequentes
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-red-600 border-red-300"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </Card>
            </div>
          )}
          {!isLoading && !error && totalFAQs > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {totalFAQs} {totalFAQs === 1 ? 'pergunta disponível' : 'perguntas disponíveis'} em {topics.length} {topics.length === 1 ? 'tópico' : 'tópicos'}
            </p>
          )}
        </div>

        {/* FAQ Content Grouped by Topics */}
        {!isLoading && !error && topics.length > 0 && (
          <div className="space-y-12 animate-slide-up">
            {topics.map((topic, topicIndex) => (
              <div key={topic} className="space-y-4">
                {/* Topic Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#F0A22E] mb-2">
                    {formatTopicName(topic)}
                  </h2>
                  <div className="w-16 h-1 bg-[#F0A22E] mx-auto rounded"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {groupedFAQs[topic].length} {groupedFAQs[topic].length === 1 ? 'pergunta' : 'perguntas'}
                  </p>
                </div>

                {/* Questions for this topic */}
                {groupedFAQs[topic].map((faq, faqIndex) => {
                  const itemId = `${topic}-${faq.id}`;
                  return (
                    <Card 
                      key={faq.id}
                      className="glass-effect border-border overflow-hidden"
                      style={{ animationDelay: `${(topicIndex * groupedFAQs[topic].length + faqIndex) * 0.05}s` }}
                    >
                      <Collapsible
                        open={openItems.includes(itemId)}
                        onOpenChange={() => toggleItem(itemId)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-6 hover:bg-accent transition-colors duration-200">
                            <h3 className="text-left text-lg font-semibold text-foreground flex-1 pr-4">
                              {faq.question}
                            </h3>
                            <ChevronDown 
                              className={`text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
                                openItems.includes(itemId) ? 'rotate-180' : ''
                              }`} 
                              size={20} 
                            />
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-6 pb-6">
                            <div className="border-t border-border pt-4">
                              <p className="text-muted-foreground leading-relaxed mb-4 whitespace-pre-wrap">
                                {faq.answer}
                              </p>
                              
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <Button
                                  onClick={() => onExplainWithAI(faq.question)}
                                  variant="outline"
                                  size="sm"
                                  className="group border-[#F0A22E] text-[#F0A22E] hover:bg-[#F0A22E] hover:text-white transition-all duration-200"
                                >
                                  <Bot className="mr-2 group-hover:animate-pulse" size={16} />
                                  Explicar com IA
                                </Button>
                                
                                {faq.updatedAt && (
                                  <span className="text-xs text-muted-foreground">
                                    Atualizado: {new Date(faq.updatedAt).toLocaleDateString('pt-BR')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && topics.length === 0 && (
          <Card className="glass-effect border-border">
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhuma pergunta disponível
              </h3>
              <p className="text-muted-foreground mb-6">
                As perguntas frequentes serão exibidas aqui em breve.
              </p>
              <Button
                onClick={() => onExplainWithAI("Tenho uma pergunta")}
                className="orange-gradient hover:opacity-90 text-white font-semibold"
              >
                <Bot className="mr-2" size={18} />
                Perguntar à IA
              </Button>
            </div>
          </Card>
        )}

        {/* Bottom CTA */}
        {!isLoading && !error && topics.length > 0 && (
          <div className="text-center mt-12 animate-scale-in">
            <Card className="glass-effect border-border p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Não encontrou sua resposta?
              </h3>
              <p className="text-muted-foreground mb-6">
                Nossa IA pode ajudar você com qualquer dúvida específica
              </p>
              <Button
                onClick={() => onExplainWithAI("Tenho uma pergunta específica sobre direitos")}
                className="orange-gradient hover:opacity-90 text-white font-semibold"
              >
                <Bot className="mr-2" size={18} />
                Conversar com IA
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQs;
