
import React from 'react';
import { Send, Bot, User, Trash2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiHelpers, apiConfig } from '@/lib/config';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface KudiChatProps {
  initialQuestion?: string;
}

const KudiChat = ({ initialQuestion }: KudiChatProps) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  // Speech Recognition and Synthesis
  const speechLang = language === 'pt' ? 'pt-BR' : 'en-US';
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    isSupported: isSpeechSupported,
    error: speechError 
  } = useSpeechRecognition(speechLang);
  
  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking, 
    isSupported: isTTSSupported 
  } = useSpeechSynthesis(speechLang);

  // Load messages from localStorage on component mount
  React.useEffect(() => {
    const savedMessages = localStorage.getItem('kudileya-chat-history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  }, []);

  // Set initial question if provided
  React.useEffect(() => {
    if (initialQuestion && !input) {
      setInput(initialQuestion);
    }
  }, [initialQuestion]);

  // Handle speech recognition transcript
  React.useEffect(() => {
    if (transcript && !isListening) {
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // Handle speech recognition errors
  React.useEffect(() => {
    if (speechError) {
      toast({
        title: t('kudichat.error.title'),
        description: speechError,
        variant: "destructive"
      });
    }
  }, [speechError, toast, t]);

  // Save messages to localStorage whenever messages change
  React.useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('kudileya-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages are added
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('kudileya-chat-history');
    stopSpeaking(); // Stop any ongoing speech
    toast({
      title: t('kudichat.cleared'),
      description: t('kudichat.cleared.description'),
    });
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSpeakResponse = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(text);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(apiHelpers.getApiUrl('/perguntar'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pergunta: userMessage.content
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na API');
      }

      const data = await response.json();
      const aiResponse = data.resposta || 'Desculpe, não consegui processar sua pergunta.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      apiHelpers.errorLog('Error sending message:', error);
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t('kudichat.fallback').replace('{question}', userMessage.content),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
      
      toast({
        title: t('kudichat.error.title'),
        description: t('kudichat.error.description'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 orange-gradient rounded-full flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('kudichat.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('kudichat.subtitle')}</p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 orange-gradient rounded-full flex items-center justify-center mx-auto mb-4 opacity-80">
                <Bot className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t('kudichat.welcome.title')}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('kudichat.welcome.description')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 animate-fade-in ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 orange-gradient rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white" size={16} />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'orange-gradient text-white'
                        : 'bg-muted border border-border text-foreground'
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                      {message.sender === 'ai' && isTTSSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSpeakResponse(message.content)}
                          className="ml-2 h-6 w-6 p-0"
                          title={isSpeaking ? t('kudichat.stop.speaking') : t('kudichat.speak')}
                        >
                          {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                        </Button>
                      )}
                    </div>
                  </div>

                  {message.sender === 'user' && (
                    <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="text-background" size={16} />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 orange-gradient rounded-full flex items-center justify-center">
                    <Bot className="text-white animate-pulse" size={16} />
                  </div>
                  <div className="bg-muted border border-border p-4 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 bg-card border-t border-border">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? t('kudichat.listening') : t('kudichat.placeholder')}
              disabled={isLoading || isListening}
              className="flex-1 bg-background border-border text-foreground placeholder-muted-foreground focus:border-[#F0A22E]"
            />
            
            {/* Speech Recognition Button */}
            {isSpeechSupported && (
              <Button
                onClick={toggleListening}
                disabled={isLoading}
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                title={isListening ? t('kudichat.listening') : t('kudichat.listen')}
                className={isListening ? 'animate-pulse' : ''}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
            )}
            
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="orange-gradient hover:opacity-90 px-6"
            >
              <Send size={18} />
            </Button>
          </div>
          
          {/* Speech Recognition Status */}
          {!isSpeechSupported && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t('kudichat.speech.not.supported')}
            </p>
          )}
          
          {!isTTSSupported && (
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {t('kudichat.tts.not.supported')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KudiChat;
