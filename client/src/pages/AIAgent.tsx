import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bot, Settings, Eye, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AIAgent() {
  const { user } = useAuth();
  
  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Bot className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-semibold text-gray-900">Loja não encontrada</h3>
          <p className="mt-1 text-gray-500">Você não tem uma loja associada para configurar o agente de IA.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agente de IA WhatsApp</h1>
                <p className="text-gray-600">{store.name} - {store.company.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Agente Ativo
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Configurações do Agente
              </CardTitle>
              <CardDescription>
                Configure as informações básicas do seu agente de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Nome do Agente</Label>
                <Input
                  id="agent-name"
                  placeholder="Ex: Assistente Bella Vista"
                  defaultValue={`Assistente ${store.name}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-number">Número WhatsApp</Label>
                <Input
                  id="whatsapp-number"
                  placeholder="Ex: +55 11 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personality">Personalidade do Agente</Label>
                <Textarea
                  id="personality"
                  placeholder="Descreva como o agente deve se comportar (amigável, profissional, etc.)"
                  defaultValue="Sou um assistente virtual amigável e prestativo do restaurante. Estou aqui para ajudar com informações sobre nosso cardápio, fazer pedidos e responder dúvidas."
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="agent-active" defaultChecked />
                <Label htmlFor="agent-active">Agente Ativo</Label>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle>Mensagem de Boas-vindas</CardTitle>
              <CardDescription>
                Primeira mensagem que os clientes recebem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Mensagem</Label>
                <Textarea
                  id="welcome-message"
                  placeholder="Escreva a mensagem de boas-vindas"
                  defaultValue={`Olá! 👋 Bem-vindo ao ${store.name}!\n\nSou seu assistente virtual e estou aqui para ajudar você a:\n• Ver nosso cardápio\n• Fazer pedidos\n• Tirar dúvidas\n\nComo posso ajudá-lo hoje?`}
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horário de Funcionamento</CardTitle>
              <CardDescription>
                Configure quando o agente deve responder automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening-time">Abertura</Label>
                  <Input
                    id="opening-time"
                    type="time"
                    defaultValue="18:00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing-time">Fechamento</Label>
                  <Input
                    id="closing-time"
                    type="time"
                    defaultValue="23:00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="closed-message">Mensagem fora do horário</Label>
                <Textarea
                  id="closed-message"
                  placeholder="Mensagem quando estiver fechado"
                  defaultValue={`Obrigado por entrar em contato com o ${store.name}!\n\nNo momento estamos fechados.\nNosso horário de funcionamento é de 18h às 23h.\n\nEm breve retornaremos seu contato! 😊`}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Respostas Automáticas</CardTitle>
              <CardDescription>
                Configure respostas para perguntas frequentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">📍 Localização</p>
                  <p className="text-sm text-gray-600">{store.address || "Endereço não configurado"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">🕒 Horário</p>
                  <p className="text-sm text-gray-600">18h às 23h - Segunda a Domingo</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">🚚 Entrega</p>
                  <p className="text-sm text-gray-600">Taxa: R$ 5,00 - Pedido mínimo: R$ 25,00</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">💳 Pagamento</p>
                  <p className="text-sm text-gray-600">Dinheiro, Pix, Cartão (débito/crédito)</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Resposta Personalizada
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t mt-6">
          <div className="text-sm text-gray-600">
            Status: <span className="text-green-600 font-medium">Agente Ativo</span>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Testar Agente
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Settings className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}