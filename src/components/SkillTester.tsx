
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { processMessage } from '@/lib/skills/skillsManager';
import { useAuth } from '@/components/AuthProvider';
import { toast } from "sonner";

const SkillTester = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleTest = async () => {
    if (!user || !input.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Test with empty message history to isolate skill detection
      const response = await processMessage(input, [], user.id);
      setResult(response);
      
      // Log which skill was used
      if (response.metadata?.skillId) {
        toast.success(`Used skill: ${response.metadata.skillId}`);
      } else {
        toast.info("Used fallback conversation skill");
      }
    } catch (err: any) {
      console.error("Test error:", err);
      setError(err.message || "An unknown error occurred");
      toast.error(`Error: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Skill Router Tester</CardTitle>
          <CardDescription>
            Test how different messages are routed to skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Test Message</label>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a test message (e.g., 'Schedule a meeting tomorrow at 3pm')"
                className="min-h-[100px]"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
            
            {result && (
              <div className="space-y-2">
                <h3 className="font-medium">Result:</h3>
                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  <p><strong>Content:</strong> {result.content}</p>
                  <p><strong>Role:</strong> {result.role}</p>
                  {result.metadata && (
                    <div>
                      <p><strong>Metadata:</strong></p>
                      <pre className="text-xs overflow-auto p-2 bg-background rounded">
                        {JSON.stringify(result.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleTest} 
            disabled={loading || !input.trim()}
          >
            {loading ? "Testing..." : "Test Skill Router"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SkillTester;
