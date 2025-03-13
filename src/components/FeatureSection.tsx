
import { useEffect, useRef } from 'react';
import { 
  MessageCircle, Shield, Zap, Database, 
  PanelLeft, Bot, Globe, Search
} from 'lucide-react';

const features = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Natural Conversations",
    description: "Engage in fluid, human-like conversations with our advanced AI assistant."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Private",
    description: "Your data is encrypted and protected with our robust security measures."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Get instant responses with our optimized AI processing technology."
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Knowledge Database",
    description: "Access information from a vast database of verified, up-to-date information."
  },
  {
    icon: <PanelLeft className="h-6 w-6" />,
    title: "Personalized Experience",
    description: "The assistant learns from your interactions to provide tailored assistance."
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "Smart Suggestions",
    description: "Receive proactive suggestions based on context and conversation history."
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Multi-language Support",
    description: "Communicate in multiple languages with our polyglot assistant."
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Advanced Search",
    description: "Find exactly what you need with our precise search capabilities."
  }
];

const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.add('opacity-100');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const featureElements = document.querySelectorAll('.feature-card');
    featureElements.forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });
    
    return () => {
      featureElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 bg-secondary/50"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our AI assistant combines cutting-edge technology with intuitive design to provide an exceptional user experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card bg-card rounded-xl p-6 shadow-soft border border-border transition-all duration-300 hover:shadow-medium hover:translate-y-[-2px]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
