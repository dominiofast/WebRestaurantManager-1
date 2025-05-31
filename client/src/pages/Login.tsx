import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BarChart3, Shield, Zap, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Replit Auth login
    window.location.href = "/api/login";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left Side - Visual Effects */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy to-blue-800 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          {/* Floating Circles */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-coral/20 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-white/10 rounded-full animate-float blur-lg"></div>
          <div className="absolute bottom-20 left-20 w-36 h-36 bg-coral/15 rounded-full animate-pulse blur-xl"></div>
          <div className="absolute bottom-40 right-32 w-28 h-28 bg-white/15 rounded-full animate-float blur-lg"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-8 grid-rows-8 h-full">
              {[...Array(64)].map((_, i) => (
                <div key={i} className="border border-white/15"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center p-12 relative z-10 text-white">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 bg-coral rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl font-bold mb-6 text-white">
              Bem-vindo de volta!
            </h1>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Acesse seu painel de controle e continue gerenciando seu restaurante com eficiência profissional.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-6 text-left">
              <div className="bg-navy/40 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-coral/30 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white drop-shadow-sm">Dashboard Inteligente</h3>
                    <p className="text-white/90 text-sm font-medium">Acompanhe vendas e estatísticas em tempo real</p>
                  </div>
                </div>
              </div>

              <div className="bg-navy/40 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-coral/30 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white drop-shadow-sm">Gestão Rápida</h3>
                    <p className="text-white/90 text-sm font-medium">Controle pedidos e cardápio com agilidade</p>
                  </div>
                </div>
              </div>

              <div className="bg-navy/40 backdrop-blur-sm rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border border-coral/30 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-coral rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white drop-shadow-sm">100% Seguro</h3>
                    <p className="text-white/90 text-sm font-medium">Seus dados protegidos com criptografia avançada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-coral to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                <ChefHat className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-navy mb-2">Fazer Login</CardTitle>
              <p className="text-gray-600">Acesse sua conta para gerenciar seu restaurante</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-navy font-semibold">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-coral transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-14 border-2 focus:border-coral transition-all duration-300 rounded-xl text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-navy font-semibold">Senha</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-coral transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-12 h-14 border-2 focus:border-coral transition-all duration-300 rounded-xl text-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-coral transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-coral focus:ring-coral" />
                    <span className="text-gray-600">Lembrar de mim</span>
                  </label>
                  <a href="#" className="text-coral hover:text-orange-600 font-semibold transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary-cta text-xl h-14 group shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="flex items-center justify-center">
                    Entrar no Sistema
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </form>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">ou</span>
                </div>
              </div>

              {/* Social Login */}
              <Button
                variant="outline"
                className="w-full h-12 border-2 hover:bg-gray-50 transition-all duration-300"
                onClick={() => window.location.href = "/api/login"}
              >
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 bg-gradient-to-br from-coral to-orange-500 rounded"></div>
                  <span className="font-semibold text-gray-700">Continuar com Replit</span>
                </div>
              </Button>

              <div className="text-center pt-6">
                <p className="text-gray-600">
                  Não tem uma conta?{" "}
                  <Link href="/register" className="text-coral font-semibold hover:text-orange-600 transition-colors">
                    Cadastre-se gratuitamente
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Landing */}
          <div className="text-center mt-8">
            <Link href="/" className="text-gray-600 hover:text-navy transition-colors inline-flex items-center group">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Voltar para página inicial
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Login Rápido</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="w-3 h-3" />
                <span>99.9% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}