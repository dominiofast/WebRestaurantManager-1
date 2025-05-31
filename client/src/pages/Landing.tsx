import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ClipboardList, BarChart3, Users, Star, CheckCircle, ArrowRight, Sparkles, Bot, MessageSquare, Brain, Zap, Phone, Mail, MapPin, TrendingUp, Target, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-navy shadow-lg border-b border-coral/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">DomínioMenu<span className="text-coral">.AI</span></div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">WhatsApp IA</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Análise Inteligente</span>
              </div>
              <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Vendas IA</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                className="bg-coral/20 text-coral border border-coral hover:bg-coral hover:text-white transition-all duration-300 font-semibold"
              >
                Teste Grátis
              </Button>
              <Button 
                onClick={handleLogin}
                className="btn-coral font-semibold"
              >
                Entrar no Sistema
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-coral/10 text-coral font-semibold text-sm border border-coral/20">
                <Bot className="w-4 h-4 mr-2" />
                Inteligência Artificial para Restaurantes
              </span>
            </div>
            <h1 className="hero-title mb-8">
              Venda Mais com 
              <span className="text-coral"> Inteligência Artificial</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              O primeiro assistente de IA do Brasil especializado em restaurantes. 
              Automatize vendas pelo WhatsApp e aumente seu faturamento em até 40%.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button 
                className="bg-coral text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-coral/90 transform hover:scale-105 transition-all duration-300 shadow-xl animate-pulse-glow group"
              >
                <span className="flex items-center">
                  <MessageSquare className="w-6 h-6 mr-3" />
                  Teste Grátis 7 Dias
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              <button 
                onClick={handleLogin}
                className="bg-white border-2 border-coral text-coral px-8 py-4 rounded-2xl text-xl font-bold hover:bg-coral hover:text-white transition-all duration-300 shadow-lg group"
              >
                <span className="flex items-center">
                  <Bot className="w-6 h-6 mr-3" />
                  Ver Demo IA
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Setup em 5 minutos</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Suporte WhatsApp</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">Cancel quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="section-title mb-6">
              Inteligência Artificial que Vende Mais
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Revolucione seu restaurante com IA especializada em aumentar vendas e automatizar operações
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="modern-card p-8 text-center group animate-float">
              <div className="icon-container mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-navy text-xl font-bold mb-4">Assistente WhatsApp IA</h3>
              <p className="text-gray-600 leading-relaxed">
                Robô inteligente que atende clientes 24/7, faz vendas automáticas e sugere combos personalizados pelo WhatsApp.
              </p>
            </div>

            <div className="modern-card p-8 text-center group animate-float" style={{animationDelay: '0.2s'}}>
              <div className="icon-container mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-navy text-xl font-bold mb-4">Análise Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                IA analisa padrões de compra, identifica oportunidades de venda e sugere estratégias para aumentar o ticket médio.
              </p>
            </div>

            <div className="modern-card p-8 text-center group animate-float" style={{animationDelay: '0.4s'}}>
              <div className="icon-container mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-navy text-xl font-bold mb-4">Vendas Automatizadas</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistema que identifica o melhor momento para fazer upselling, cross-selling e campanhas personalizadas.
              </p>
            </div>

            <div className="modern-card p-8 text-center group animate-float" style={{animationDelay: '0.6s'}}>
              <div className="icon-container mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-coral" />
              </div>
              <h3 className="text-navy text-xl font-bold mb-4">Gestão Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistema completo para otimizar todas as operações do seu restaurante de forma profissional e integrada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="section-title mb-8">
                Por que escolher o RestaurantPRO?
              </h2>
              <div className="space-y-6">
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Fácil de usar</h3>
                    <p className="text-gray-600 leading-relaxed">Interface intuitiva que sua equipe aprende rapidamente, sem necessidade de treinamento complexo.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Aumento da eficiência</h3>
                    <p className="text-gray-600 leading-relaxed">Reduza erros operacionais e otimize o tempo de atendimento com automação inteligente.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Controle total</h3>
                    <p className="text-gray-600 leading-relaxed">Tenha visibilidade completa do seu negócio com relatórios em tempo real e análises detalhadas.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Aumento das vendas</h3>
                    <p className="text-gray-600 leading-relaxed">Maximize a receita com gestão inteligente de cardápio e otimização de processos.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="stats-card max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-7 h-7 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <h3 className="text-3xl font-bold text-navy mb-3">Sistema Completo</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">Tudo que você precisa para modernizar e otimizar seu restaurante</p>
                </div>
                <button 
                  onClick={handleLogin}
                  className="w-full btn-primary-cta text-lg group"
                >
                  <span className="flex items-center justify-center">
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Sem cartão de crédito • Configuração em 5 minutos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-cta py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">
            Pronto para transformar seu restaurante?
          </h2>
          <p className="text-xl lg:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Acesse o sistema agora e comece a otimizar suas operações hoje mesmo. 
            Junte-se a centenas de restaurantes que já modernizaram sua gestão.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleLogin}
              className="btn-primary-cta text-xl group"
            >
              <span className="flex items-center">
                Entrar no Sistema
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <div className="text-white/80 text-sm">
              ⚡ Configuração rápida • 🔒 100% seguro • 📞 Suporte especializado
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="text-xl font-bold mb-2">RestaurantPRO</div>
          <p className="text-gray-400">Sistema completo de gestão para restaurantes</p>
        </div>
      </footer>
    </div>
  );
}
