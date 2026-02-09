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

interface Questao {
  pergunta: string;
  resposta: string;
  resposta_rapida?: string;
}

interface Tema {
  tema: string;
  questoes: Questao[];
}

interface APIResponse {
  temas: Tema[];
}

interface FAQ {
  id?: string;
  pergunta: string;
  resposta: string;
}

const FAQs = ({ onExplainWithAI }: FAQsProps) => {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // Fallback FAQs (existing ones)
  const fallbackFAQs: FAQ[] = [
    {
      id: "1",
      pergunta: "O que é a Kudileya e como ela pode me ajudar?",
      resposta: "A Kudileya é uma startup de inteligência artificial focada em revolucionar o atendimento ao cliente. Nossa plataforma oferece soluções de chatbot avançadas que podem responder perguntas, resolver problemas e fornecer suporte 24/7 de forma personalizada e eficiente."
    },
    {
      id: "2",
      pergunta: "Como funciona o sistema de IA da Kudileya?",
      resposta: "Nosso sistema utiliza modelos de linguagem avançados treinados para compreender contexto, manter conversas naturais e fornecer respostas precisas. A IA aprende continuamente com cada interação para melhorar suas respostas ao longo do tempo."
    },
    {
      id: "3",
      pergunta: "A Kudileya é segura para usar com dados sensíveis?",
      resposta: "Sim, a segurança é nossa prioridade máxima. Implementamos criptografia de ponta a ponta, protocolos de segurança robustos e seguimos as melhores práticas de proteção de dados para garantir que suas informações estejam sempre seguras."
    },
    {
      id: "4",
      pergunta: "Posso integrar a Kudileya com outros sistemas?",
      resposta: "Absolutamente! Oferecemos APIs flexíveis e SDKs que permitem integração fácil com uma ampla variedade de sistemas existentes, incluindo CRMs, plataformas de e-commerce, sistemas de ticketing e muito mais."
    },
    {
      id: "5",
      pergunta: "Qual é o custo dos serviços da Kudileya?",
      resposta: "Oferecemos planos flexíveis para diferentes necessidades e tamanhos de empresa. Temos desde planos básicos para startups até soluções enterprise personalizadas. Entre em contato conosco para uma proposta personalizada."
    },
    {
      id: "6",
      pergunta: "Como posso começar a usar a Kudileya?",
      resposta: "É muito simples! Você pode começar criando uma conta gratuita em nossa plataforma, configurando seu primeiro chatbot em minutos e testando nossa IA. Nossa equipe de onboarding está disponível para ajudar você em cada passo do processo."
    }
  ];

  // Fetch FAQs from API
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<APIResponse> => {
      apiHelpers.debugLog('Fetching FAQs from API...');
      const response = await fetch(apiHelpers.getApiUrl('/faqs'));
      
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

  // Process API data or use fallback
  const { temas, faqs } = React.useMemo(() => {
    if (error || !apiData?.temas) {
      apiHelpers.debugLog('API error or no data, using fallback FAQs:', error);
      return {
        temas: null,
        faqs: fallbackFAQs
      };
    }
    
    apiHelpers.debugLog('Using API data with themes');
    return {
      temas: apiData.temas,
      faqs: []
    };
  }, [apiData, error]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const generateId = (themeIndex: number, questionIndex: number) => {
    return `theme-${themeIndex}-question-${questionIndex}`;
  };

  const generateFallbackId = (index: number) => {
    return `fallback-${index}`;
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
            <p className="text-sm text-muted-foreground mt-2">
              Exibindo perguntas em modo offline
            </p>
          )}
        </div>

        {/* FAQ Content by Themes or Fallback */}
        <div className="space-y-8 animate-slide-up">
          {temas ? (
            // Display themed FAQs
            temas.map((tema, themeIndex) => (
              <div key={themeIndex} className="space-y-4">
                {/* Theme Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#F0A22E] mb-2">
                    {tema.tema}
                  </h2>
                  <div className="w-16 h-1 bg-[#F0A22E] mx-auto rounded"></div>
                </div>

                {/* Questions for this theme */}
                {tema.questoes.map((questao, questionIndex) => {
                  const itemId = generateId(themeIndex, questionIndex);
                  return (
                    <Card 
                      key={itemId}
                      className="glass-effect border-border overflow-hidden"
                      style={{ animationDelay: `${(themeIndex * tema.questoes.length + questionIndex) * 0.1}s` }}
                    >
                      <Collapsible
                        open={openItems.includes(itemId)}
                        onOpenChange={() => toggleItem(itemId)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-6 hover:bg-accent transition-colors duration-200">
                            <h3 className="text-left text-lg font-semibold text-foreground flex-1 pr-4">
                              {questao.pergunta}
                            </h3>
                            <ChevronDown 
                              className={`text-muted-foreground transition-transform duration-200 ${
                                openItems.includes(itemId) ? 'rotate-180' : ''
                              }`} 
                              size={20} 
                            />
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-6 pb-6">
                            <div className="border-t border-border pt-4">
                              <p className="text-muted-foreground leading-relaxed mb-4">
                                {questao.resposta}
                              </p>
                              
                              <Button
                                onClick={() => onExplainWithAI(questao.pergunta)}
                                variant="outline"
                                size="sm"
                                className="group border-[#F0A22E] text-[#F0A22E] hover:bg-[#F0A22E] hover:text-white transition-all duration-200"
                              >
                                <Bot className="mr-2 group-hover:animate-pulse" size={16} />
                                Explicar com IA
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            ))
          ) : (
            // Display fallback FAQs
            faqs.map((faq, index) => {
              const itemId = generateFallbackId(index);
              return (
                <Card 
                  key={itemId}
                  className="glass-effect border-border overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Collapsible
                    open={openItems.includes(itemId)}
                    onOpenChange={() => toggleItem(itemId)}
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-6 hover:bg-accent transition-colors duration-200">
                        <h3 className="text-left text-lg font-semibold text-foreground flex-1 pr-4">
                          {faq.pergunta}
                        </h3>
                        <ChevronDown 
                          className={`text-muted-foreground transition-transform duration-200 ${
                            openItems.includes(itemId) ? 'rotate-180' : ''
                          }`} 
                          size={20} 
                        />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-6 pb-6">
                        <div className="border-t border-border pt-4">
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {faq.resposta}
                          </p>
                          
                          <Button
                            onClick={() => onExplainWithAI(faq.pergunta)}
                            variant="outline"
                            size="sm"
                            className="group border-[#F0A22E] text-[#F0A22E] hover:bg-[#F0A22E] hover:text-white transition-all duration-200"
                          >
                            <Bot className="mr-2 group-hover:animate-pulse" size={16} />
                            Explicar com IA
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
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
      </div>
    </div>
  );
};

export default FAQs;
