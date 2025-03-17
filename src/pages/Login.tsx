
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Lock, Mail, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"signIn" | "signUp">("signIn");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (activeTab === "signIn") {
      await signIn(values.email, values.password);
    } else {
      await signUp(values.email, values.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-2xl font-semibold">
            <MessageCircle className="h-6 w-6" />
            <span>AssistantAI</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl shadow-medium overflow-hidden animate-scale-up">
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-center mb-2">
              {activeTab === "signIn" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-muted-foreground text-center mb-6">
              {activeTab === "signIn" 
                ? "Sign in to continue to AssistantAI" 
                : "Sign up to start using AssistantAI"}
            </p>
            
            <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 mt-0.5 text-green-600" />
                <AlertDescription>
                  <strong>Recommended:</strong> Sign in with Google to enable calendar features without additional setup.
                </AlertDescription>
              </div>
            </Alert>

            <Button 
              type="button" 
              variant="default" 
              className="w-full mb-4 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
              onClick={() => signInWithGoogle(true)}
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
            
            <Tabs defaultValue="signIn" value={activeTab} onValueChange={(v) => setActiveTab(v as "signIn" | "signUp")}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="signIn">Sign In</TabsTrigger>
                <TabsTrigger value="signUp">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signIn" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="example@example.com" 
                              type="email" 
                              autoComplete="email"
                              disabled={loading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              autoComplete="current-password"
                              disabled={loading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button variant="link" size="sm" className="px-0 h-auto font-normal">
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="signUp" className="mt-0">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="example@example.com" 
                              type="email" 
                              autoComplete="email"
                              disabled={loading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              autoComplete="new-password"
                              disabled={loading}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="text-xs text-muted-foreground">
                      By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="p-6 bg-muted border-t border-border flex items-center justify-center">
            <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Your data is securely encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
