import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ClipboardList, BarChart3, Users, Star, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-navy shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-white">RestaurantPRO</div>
            <Button 
              onClick={handleLogin}
              className="btn-coral"
            >
              Entrar no Sistema
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-navy mb-6">
              Gestão Completa para seu
              <span className="text-coral"> Restaurante</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Sistema profissional que otimiza todas as operações do seu restaurante. 
              Gerencie cardápio, pedidos e vendas de forma inteligente e eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleLogin}
                className="btn-coral text-lg px-8 py-4 h-auto"
              >
                Começar Agora
              </Button>
              <Button 
                variant="outline"
                className="text-lg px-8 py-4 h-auto border-navy text-navy hover:bg-navy hover:text-white"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy mb-4">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Funcionalidades completas para modernizar a gestão do seu restaurante
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-navy text-xl">Gestão de Cardápio</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Organize categorias e itens do seu cardápio com facilidade. Adicione fotos, preços e controle disponibilidade.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-navy text-xl">Controle de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Acompanhe pedidos em tempo real com status de preparo e entrega. Organize a cozinha de forma eficiente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-navy text-xl">Dashboard Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Visualize vendas, estatísticas e relatórios em tempo real. Tome decisões baseadas em dados.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-coral/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-coral" />
                </div>
                <CardTitle className="text-navy text-xl">Gestão Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center">
                  Sistema completo para otimizar todas as operações do seu restaurante de forma profissional.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-navy mb-6">
                Por que escolher o RestaurantPRO?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Fácil de usar</h3>
                    <p className="text-gray-600">Interface intuitiva que sua equipe aprende rapidamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Aumento da eficiência</h3>
                    <p className="text-gray-600">Reduza erros e otimize o tempo de atendimento</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Controle total</h3>
                    <p className="text-gray-600">Tenha visibilidade completa do seu negócio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-coral mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-navy mb-2">Aumento das vendas</h3>
                    <p className="text-gray-600">Maximize a receita com gestão inteligente</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <h3 className="text-2xl font-bold text-navy mb-2">Sistema Completo</h3>
                  <p className="text-gray-600">Tudo que você precisa para modernizar seu restaurante</p>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full btn-coral text-lg py-4 h-auto"
                >
                  Começar Gratuitamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para transformar seu restaurante?
          </h2>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Acesse o sistema agora e comece a otimizar suas operações hoje mesmo.
          </p>
          <Button 
            onClick={handleLogin}
            className="btn-coral text-lg px-8 py-4 h-auto"
          >
            Entrar no Sistema
          </Button>
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
