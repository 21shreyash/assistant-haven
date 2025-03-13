
import HeroSection from "@/components/HeroSection";
import FeatureSection from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { ArrowRight, Github } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureSection />
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to experience the future of AI assistance?</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Start chatting with our AI assistant now and discover how it can help you with information, tasks, and more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/chat" : "/login"}>
              <Button size="lg" className="w-full sm:w-auto group">
                {user ? "Continue chatting" : "Get started for free"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="https://github.com/yourusername/your-assistant-repo" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-2 font-semibold">
                AssistantAI
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                &copy; {new Date().getFullYear()} AssistantAI. All rights reserved.
              </p>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
