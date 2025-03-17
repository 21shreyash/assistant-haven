
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (withCalendarScope?: boolean) => Promise<void>;
  isAuthenticatedWithGoogle: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticatedWithGoogle, setIsAuthenticatedWithGoogle] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      
      // Check if user is authenticated with Google
      if (session?.user?.app_metadata?.provider === 'google') {
        setIsAuthenticatedWithGoogle(true);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // Check if user is authenticated with Google
      if (session?.user?.app_metadata?.provider === 'google') {
        setIsAuthenticatedWithGoogle(true);
      } else {
        setIsAuthenticatedWithGoogle(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for calendar_connected parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const calendarConnected = params.get('calendar_connected');
    
    if (calendarConnected === 'success') {
      toast.success('Google Calendar connected successfully!');
      
      // Remove the query parameter
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully!');
      navigate('/chat');
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Sign up successful! Please check your email for verification.');
    } catch (error: any) {
      toast.error(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async (withCalendarScope: boolean = false) => {
    try {
      setLoading(true);
      console.log('Signing in with Google...', withCalendarScope ? 'with calendar scope' : 'without calendar scope');
      
      // For basic Google sign-in without calendar scope
      const options = {
        redirectTo: `${window.location.origin}/chat`,
      };
      
      // Use scopes option directly if calendar scope is requested
      // This is the proper way to specify scopes according to the Supabase types
      if (withCalendarScope) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/chat`,
            scopes: 'https://www.googleapis.com/auth/calendar',
          },
        });
        
        if (error) throw error;
      } else {
        // Basic Google sign-in without calendar scope
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options,
        });
        
        if (error) throw error;
      }
      
      // No success toast here as user will be redirected to Google
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Error signing in with Google');
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      signInWithGoogle,
      isAuthenticatedWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
