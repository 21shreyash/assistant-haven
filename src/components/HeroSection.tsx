
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const HeroSection = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div 
        className={`container max-w-5xl mx-auto text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="inline-block mb-6">
          <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase">
            Intelligent Assistance
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
          Your AI Assistant for 
          <span className="relative ml-2">
            <span className="relative z-10">Everything</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-accent -z-0"></span>
          </span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Get instant help, answers, and assistance with our advanced AI chat assistant. 
          Powered by cutting-edge technology for natural conversations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={user ? "/chat" : "/login"}>
            <Button size="lg" className="w-full sm:w-auto group">
              {user ? "Start chatting" : "Get started"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Learn more
          </Button>
        </div>

        {/* Chat preview */}
        <div 
          className="mt-16 max-w-md mx-auto bg-card rounded-2xl shadow-medium p-4 border border-border"
        >
          <div className="space-y-4">
            <div className="chat-bubble-ai animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <p>Hello! How can I help you today?</p>
            </div>
            <div className="chat-bubble-user animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <p>I need information about renewable energy.</p>
            </div>
            <div className="chat-bubble-ai animate-slide-up" style={{ animationDelay: '0.9s' }}>
              <p>Of course! Renewable energy comes from sources that naturally replenish. The main types include solar, wind, hydro, and geothermal power.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
