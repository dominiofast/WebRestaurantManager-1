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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy shadow-lg border-b border-coral/20">
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
                onClick={handleLogin}
                className="bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300 font-semibold"
              >
                Entrar no Sistema
              </Button>
              <Button 
                className="bg-coral text-white border border-coral hover:bg-coral/90 transition-all duration-300 font-semibold"
              >
                Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-24 lg:pt-40 lg:pb-32 relative overflow-hidden">
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
                Previsão de demanda, otimização de cardápio e insights automáticos para maximizar lucros do seu restaurante.
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
                Por que escolher o DomínioMenu.AI?
              </h2>
              <div className="space-y-6">
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">IA Especializada</h3>
                    <p className="text-gray-600 leading-relaxed">Primeira IA do Brasil focada exclusivamente em restaurantes, com algoritmos otimizados para vendas.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">WhatsApp Inteligente</h3>
                    <p className="text-gray-600 leading-relaxed">Robô que vende 24/7 pelo WhatsApp, sugere combos e aumenta seu ticket médio automaticamente.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Aumento de 40% nas Vendas</h3>
                    <p className="text-gray-600 leading-relaxed">Comprovado: restaurantes aumentam faturamento em até 40% com nossas estratégias de IA.</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-navy mb-2">Setup em 5 Minutos</h3>
                    <p className="text-gray-600 leading-relaxed">Conecta com seu WhatsApp em minutos. Sem complicação, sem instalação, sem dor de cabeça.</p>
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
                  <h3 className="text-3xl font-bold text-navy mb-3">IA para Restaurantes</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">O primeiro assistente inteligente que realmente aumenta suas vendas</p>
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
            Pronto para vender mais com IA?
          </h2>
          <p className="text-xl lg:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Conecte seu WhatsApp agora e deixe nossa IA vender por você 24 horas por dia. 
            Junte-se a centenas de restaurantes que já aumentaram suas vendas com IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              className="bg-coral text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-coral/90 transform hover:scale-105 transition-all duration-300 shadow-xl group"
            >
              <span className="flex items-center">
                <MessageSquare className="w-6 h-6 mr-3" />
                Começar Teste Grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={handleLogin}
              className="bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-white/30 transition-all duration-300 group"
            >
              <span className="flex items-center">
                <Bot className="w-6 h-6 mr-3" />
                Ver Como Funciona
              </span>
            </button>
          </div>
          <div className="mt-8 text-white/80 text-sm">
            Setup em 5 minutos • Teste 7 dias grátis • Suporte WhatsApp
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">DomínioMenu<span className="text-coral">.AI</span></div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                O primeiro assistente de IA do Brasil especializado em aumentar vendas de restaurantes pelo WhatsApp.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-coral transition-colors cursor-pointer">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-coral transition-colors cursor-pointer">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-coral transition-colors cursor-pointer">
                  <Phone className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Funcionalidades IA</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Bot className="w-4 h-4 text-coral" />
                  <span>Assistente WhatsApp</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Brain className="w-4 h-4 text-coral" />
                  <span>Análise Inteligente</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <TrendingUp className="w-4 h-4 text-coral" />
                  <span>Vendas Automatizadas</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Target className="w-4 h-4 text-coral" />
                  <span>Gestão Inteligente</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Clock className="w-4 h-4 text-coral" />
                  <span>Atendimento 24/7</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4 text-coral" />
                  <span>Suporte WhatsApp</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <Zap className="w-4 h-4 text-coral" />
                  <span>Setup em 5 minutos</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors">
                  <CheckCircle className="w-4 h-4 text-coral" />
                  <span>Teste 7 dias grátis</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold text-white mb-4">Contato</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-coral" />
                  <span>WhatsApp: (11) 99999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-coral" />
                  <span>contato@dominiomenu.ai</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-coral" />
                  <span>São Paulo, Brasil</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 DomínioMenu.AI. Todos os direitos reservados.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidade</span>
                <span className="hover:text-white transition-colors cursor-pointer">Termos de Uso</span>
                <span className="hover:text-white transition-colors cursor-pointer">FAQ</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
