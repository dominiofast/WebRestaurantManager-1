import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bot, Store } from "lucide-react";

export default function SimpleLogin() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleLogin = () => {
    // Simple demo login - set user data in localStorage
    const demoUser = {
      id: "demo-user",
      firstName: "Gerente",
      lastName: "Demo",
      email: credentials.email || "demo@restaurant.com",
      role: "manager",
      isAuthenticated: true,
      ownerName: "Gerente Demo"
    };

    localStorage.setItem('restaurantUser', JSON.stringify(demoUser));
    
    // Refresh the page to trigger authentication check
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">DomínioMenu.AI</h1>
          <p className="text-gray-600">Acesse seu painel de gerenciamento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full"
            >
              <Store className="h-4 w-4 mr-2" />
              Entrar
            </Button>
            
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Demo: Use qualquer email/senha para entrar
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}