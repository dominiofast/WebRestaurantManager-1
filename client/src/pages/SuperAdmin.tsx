import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, Store } from "lucide-react";
import StatsCard from "@/components/StatsCard";

export default function SuperAdmin() {
  // Buscar estatísticas globais
  const { data: globalStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/global-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/global-stats');
      if (!res.ok) throw new Error('Erro ao buscar estatísticas');
      return res.json();
    }
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Administração</h1>
          <p className="text-gray-600">Visão geral da plataforma DomínioMenu.AI</p>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Vendas Totais"
          value={`R$ ${globalStats?.totalSales?.toLocaleString() || '0'}`}
          icon={DollarSign}
          trend="+12.5%"
          description="vs. mês anterior"
        />
        <StatsCard
          title="Pedidos Totais"
          value={globalStats?.totalOrders?.toString() || '0'}
          icon={TrendingUp}
          trend="+8.2%"
          description="vs. mês anterior"
        />
        <StatsCard
          title="Usuários Ativos"
          value={globalStats?.activeUsers?.toString() || '0'}
          icon={Users}
          trend="+15.3%"
          description="vs. mês anterior"
        />
        <StatsCard
          title="Restaurantes"
          value={globalStats?.totalRestaurants?.toString() || '0'}
          icon={Store}
          trend="+5.1%"
          description="vs. mês anterior"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/stores'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-coral" />
              Gestão de Lojas
            </CardTitle>
            <CardDescription>
              Gerencie empresas e suas lojas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Acesse o painel completo de gestão de empresas e lojas da plataforma.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-coral" />
              Usuários
            </CardTitle>
            <CardDescription>
              Gestão de usuários da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Visualize e gerencie todos os usuários cadastrados na plataforma.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-coral" />
              Relatórios
            </CardTitle>
            <CardDescription>
              Análises e relatórios globais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Acesse relatórios detalhados sobre o desempenho da plataforma.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Plataforma</CardTitle>
          <CardDescription>
            Estatísticas e métricas importantes do DomínioMenu.AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Taxa de Crescimento Mensal</span>
              <span className="text-sm font-bold text-green-600">+23.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Satisfação dos Clientes</span>
              <span className="text-sm font-bold text-green-600">4.8/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Uptime do Sistema</span>
              <span className="text-sm font-bold text-green-600">99.9%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Tempo Médio de Resposta</span>
              <span className="text-sm font-bold text-blue-600">120ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}