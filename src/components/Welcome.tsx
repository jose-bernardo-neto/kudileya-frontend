
import React from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WelcomeProps {
  onGetStarted: () => void;
}

const Welcome = ({ onGetStarted }: WelcomeProps) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=400&fit=crop",
      title: "Direitos Explicados Simples",
      description: "Entenda seus direitos e deveres com explicações claras e acessíveis, sem complicação jurídica."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
      title: "Inteligência Artificial Jurídica",
      description: "Nossa IA especializada traduz linguagem jurídica complexa em explicações que qualquer pessoa pode entender."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=400&fit=crop",
      title: "Acesso Democrático à Justiça",
      description: "Democratizamos o conhecimento jurídico, tornando as leis acessíveis para todos os cidadãos angolanos."
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  React.useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="max-w-6xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
            Bem-vindo ao
          </h1>
          <h2 className="text-6xl md:text-8xl font-bold mb-8 text-[#F0A22E]">
            Kudileya
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explicamos leis de forma simples para você usando inteligência artificial, tornando o direito acessível a todos
          </p>
        </div>

        {/* Slideshow */}
        <div className="mb-12 animate-slide-up">
          <div className="relative max-w-4xl mx-auto">
            <Card className="overflow-hidden glass-effect border-border shadow-2xl">
              <div className="relative h-[500px] md:h-[600px]">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-2/3 object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {slides[currentSlide].title}
                  </h3>
                  <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <ChevronLeft size={24} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 transition-all duration-200"
                >
                  <ChevronRight size={24} />
                </Button>
              </div>
            </Card>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide
                      ? 'bg-[#F0A22E]'
                      : 'bg-muted hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="animate-scale-in">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="group orange-gradient hover:opacity-90 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Começar Agora
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-200" size={20} />
          </Button>
          <p className="mt-4 text-muted-foreground">
            Descubra seus direitos de forma simples e clara
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
