
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
import { MessageCircle, Lock } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { signIn, signUp, loading } = useAuth();
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
