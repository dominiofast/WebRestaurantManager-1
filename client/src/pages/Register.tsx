import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Store, Users, TrendingUp, CheckCircle, ArrowRight, Mail, Lock, User, Building } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
    console.log("Registration data:", formData);
  };

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left Side - Visual Effects */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-coral/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-white/10 rounded-full animate-float"></div>
          <div className="absolute bottom-32 left-32 w-28 h-28 bg-coral/15 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-20 h-20 bg-white/15 rounded-full animate-float"></div>
        </div>

        <div className="flex flex-col justify-center items-center p-12 relative z-10 text-white">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-coral rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <Store className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold mb-6 text-white">
              Transforme seu Restaurante
            </h1>
            
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              Junte-se a centenas de restaurantes que já modernizaram sua gestão com nosso sistema profissional.
            </p>

            {/* Benefits List */}
            <div className="space-y-6 text-left">
              <div className="flex items-center space-x-4 bg-navy/40 backdrop-blur-sm rounded-xl p-5 border border-coral/30 shadow-lg">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">Gestão Completa</h3>
                  <p className="text-white/90 text-sm font-medium">Cardápio, pedidos e vendas em um só lugar</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-navy/40 backdrop-blur-sm rounded-xl p-5 border border-coral/30 shadow-lg">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">Aumento das Vendas</h3>
                  <p className="text-white/90 text-sm font-medium">Otimize operações e maximize receita</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-navy/40 backdrop-blur-sm rounded-xl p-5 border border-coral/30 shadow-lg">
                <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white drop-shadow-sm">Fácil de Usar</h3>
                  <p className="text-white/90 text-sm font-medium">Interface intuitiva para toda equipe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          <Card className="shadow-2xl border-0 bg-white">
            <CardHeader className="text-center pb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-coral to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-navy">Cadastre seu Restaurante</CardTitle>
              <p className="text-gray-700 mt-1 text-sm font-medium">Comece a modernizar sua gestão hoje</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-gray-800 font-bold text-sm">Nome do Restaurante</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="restaurantName"
                      name="restaurantName"
                      type="text"
                      placeholder="Ex: Restaurante do Chef"
                      value={formData.restaurantName}
                      onChange={handleInputChange}
                      className="pl-10 h-10 border-2 focus:border-coral text-gray-900 bg-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-gray-800 font-bold text-sm">Nome do Proprietário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="ownerName"
                      name="ownerName"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="pl-10 h-10 border-2 focus:border-coral text-gray-900 bg-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-800 font-bold text-sm">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-10 border-2 focus:border-coral text-gray-900 bg-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-800 font-bold text-sm">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 h-10 border-2 focus:border-coral text-gray-900 bg-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-800 font-bold text-sm">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 h-10 border-2 focus:border-coral text-gray-900 bg-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full btn-primary-cta text-base h-10 group"
                >
                  <span className="flex items-center justify-center">
                    Criar Conta
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>

                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Já tem uma conta?{" "}
                    <Link href="/login" className="text-coral font-semibold hover:text-orange-600 transition-colors">
                      Fazer login
                    </Link>
                  </p>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    Ao criar uma conta, você concorda com nossos{" "}
                    <a href="#" className="text-coral hover:underline">Termos de Uso</a> e{" "}
                    <a href="#" className="text-coral hover:underline">Política de Privacidade</a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Back to Landing */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-600 hover:text-navy transition-colors inline-flex items-center">
              ← Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}