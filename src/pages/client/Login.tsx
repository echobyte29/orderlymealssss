import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Lock, User, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ClientLogin() {
  const [isCustomerLogin, setIsCustomerLogin] = useState(true);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      toast({
        title: "Google Login Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate(isCustomerLogin ? "/menu" : "/client/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <ChefHat className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {isCustomerLogin ? "Customer Login" : "Kitchen Manager"}
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to continue
          </p>
        </div>

        <Card className="shadow-warm">
          <CardHeader>
            <CardTitle className="text-center">{isCustomerLogin ? "Customer Sign In" : "Kitchen Login"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isCustomerLogin ? (
              <Button onClick={handleGoogleLogin} className="w-full bg-gradient-primary" disabled={isLoading}>
                <LogIn className="mr-2 h-4 w-4" /> {isLoading ? "Redirecting..." : "Sign in with Google"}
              </Button>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={credentials.password}
                      onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t text-center">
              <Button variant="link" onClick={() => setIsCustomerLogin(!isCustomerLogin)}>
                {isCustomerLogin ? "Are you a kitchen manager?" : "Are you a customer?"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}