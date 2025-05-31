import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ClipboardList, BarChart3, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-blue-900 to-navy">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center text-white mb-16">
          <h1 className="text-5xl font-bold mb-4">RestaurantPRO</h1>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Sistema completo de gestão para restaurantes. Gerencie cardápio, pedidos e vendas de forma profissional.
          </p>
          <Button 
            onClick={handleLogin}
            className="btn-coral text-lg px-8 py-4 h-auto"
          >
            Entrar no Sistema
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <ChefHat className="w-12 h-12 mx-auto mb-4 text-coral" />
              <CardTitle>Gestão de Cardápio</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-200">
                Organize categorias e itens do seu cardápio com facilidade. Adicione fotos e preços.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-coral" />
              <CardTitle>Controle de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-200">
                Acompanhe pedidos em tempo real com status de preparo e entrega.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-coral" />
              <CardTitle>Dashboard Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-200">
                Visualize vendas, estatísticas e relatórios em um painel intuitivo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-coral" />
              <CardTitle>Gestão Completa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-200">
                Sistema profissional para otimizar as operações do seu restaurante.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Pronto para começar?
              </h2>
              <p className="text-blue-200 mb-6">
                Acesse o sistema e transforme a gestão do seu restaurante hoje mesmo.
              </p>
              <Button 
                onClick={handleLogin}
                className="btn-coral text-lg px-8 py-4 h-auto"
              >
                Entrar Agora
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
