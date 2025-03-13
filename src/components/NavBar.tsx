
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, LogOut, Menu, X } from 'lucide-react';

const NavBar = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 glass-morphism shadow-soft' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="text-xl font-semibold tracking-tight transition-all hover:opacity-80"
          >
            <span className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>AssistantAI</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  to="/chat" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/chat' ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Chat
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="ml-2"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="animate-fade-in"
                >
                  Sign in
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-morphism mt-2 p-4 animate-slide-down">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-sm font-medium p-2 rounded-md ${
                location.pathname === '/' 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  to="/chat" 
                  className={`text-sm font-medium p-2 rounded-md ${
                    location.pathname === '/chat' 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Chat
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/login" className="w-full">
                <Button variant="default" size="sm" className="w-full justify-start">
                  Sign in
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default NavBar;
