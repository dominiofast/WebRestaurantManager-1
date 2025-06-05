import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bot, Settings, MessageSquare, Shield, Save, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AiAgentConfig {
  id?: number;
  storeId: number;
  name: string;
  language: string;
  humorType: string;
  empathyLevel: number;
  formalityLevel: number;
  responseSpeed: string;
  maxTokens: number;
  temperature: string;
  conversationMemory: number;
  useEmojis: boolean;
  canMakeJokes: boolean;
  canGiveAdvice: boolean;
  canRecommendProducts: boolean;
  useAnalogies: boolean;
  welcomeMessage: string;
  awayMessage: string;
  errorMessage: string;
  blockedTopics: string[];
  prohibitedWords: string[];
  isActive: boolean;
}

export default function AiAgentConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<AiAgentConfig>({
    storeId: 0,
    name: "Assistente IA",
    language: "pt-BR",
    humorType: "profissional",
    empathyLevel: 7,
    formalityLevel: 5,
    responseSpeed: "moderada",
    maxTokens: 500,
    temperature: "0.7",
    conversationMemory: 10,
    useEmojis: false,
    canMakeJokes: true,
    canGiveAdvice: true,
    canRecommendProducts: true,
    useAnalogies: true,
    welcomeMessage: "Olá! Como posso ajudá-lo hoje?",
    awayMessage: "No momento estou ausente, mas retornarei em breve!",
    errorMessage: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
    blockedTopics: [],
    prohibitedWords: [],
    isActive: true
  });

  const { data: agentData, isLoading } = useQuery({
    queryKey: ['/api/ai-agent']
  });

  useEffect(() => {
    if (agentData) {
      setConfig({
        ...agentData,
        blockedTopics: agentData.blockedTopics || [],
        prohibitedWords: agentData.prohibitedWords || []
      });
    }
  }, [agentData]);

  const saveMutation = useMutation({
    mutationFn: (data: AiAgentConfig) => apiRequest('/api/ai-agent', 'PUT', data),
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações do agente IA foram salvas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const resetMutation = useMutation({
    mutationFn: () => apiRequest('/api/ai-agent', 'DELETE'),
    onSuccess: () => {
      setConfig({
        storeId: 0,
        name: "Assistente IA",
        language: "pt-BR",
        humorType: "profissional",
        empathyLevel: 7,
        formalityLevel: 5,
        responseSpeed: "moderada",
        maxTokens: 500,
        temperature: "0.7",
        conversationMemory: 10,
        useEmojis: false,
        canMakeJokes: true,
        canGiveAdvice: true,
        canRecommendProducts: true,
        useAnalogies: true,
        welcomeMessage: "Olá! Como posso ajudá-lo hoje?",
        awayMessage: "No momento estou ausente, mas retornarei em breve!",
        errorMessage: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
        blockedTopics: [],
        prohibitedWords: [],
        isActive: true
      });
      toast({
        title: "Configurações restauradas",
        description: "As configurações foram restauradas para os valores padrão.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent'] });
    }
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      resetMutation.mutate();
    }
  };

  const updateConfig = (field: keyof AiAgentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateBlockedTopics = (value: string) => {
    const topics = value.split(',').map(item => item.trim()).filter(item => item);
    updateConfig('blockedTopics', topics);
  };

  const updateProhibitedWords = (value: string) => {
    const words = value.split(',').map(item => item.trim()).filter(item => item);
    updateConfig('prohibitedWords', words);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Configuração do Agente IA
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Personalize o comportamento do seu assistente inteligente
        </p>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Configure as informações fundamentais do agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => updateConfig('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Idioma Principal</Label>
              <Select value={config.language} onValueChange={(value) => updateConfig('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="pt-PT">Português (Portugal)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalidade e Comportamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Personalidade e Comportamento
          </CardTitle>
          <CardDescription>
            Defina como o agente se comporta nas conversas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="humorType">Tipo de Humor</Label>
            <Select value={config.humorType} onValueChange={(value) => updateConfig('humorType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="amigavel">Amigável</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="bem-humorado">Bem-Humorado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nível de Empatia: {config.empathyLevel}</Label>
            <Slider
              value={[config.empathyLevel]}
              onValueChange={(value) => updateConfig('empathyLevel', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Nível de Formalidade: {config.formalityLevel}</Label>
            <Slider
              value={[config.formalityLevel]}
              onValueChange={(value) => updateConfig('formalityLevel', value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseSpeed">Velocidade de Resposta</Label>
            <Select value={config.responseSpeed} onValueChange={(value) => updateConfig('responseSpeed', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rapida">Rápida e Concisa</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="detalhada">Detalhada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configurações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações Técnicas
          </CardTitle>
          <CardDescription>
            Parâmetros técnicos do modelo de IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Máximo de Tokens</Label>
              <Input
                id="maxTokens"
                type="number"
                min="50"
                max="4000"
                value={config.maxTokens}
                onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Temperatura (Criatividade): {config.temperature}</Label>
              <Slider
                value={[parseFloat(config.temperature)]}
                onValueChange={(value) => updateConfig('temperature', value[0].toString())}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversationMemory">Memória de Conversas</Label>
              <Input
                id="conversationMemory"
                type="number"
                min="0"
                max="50"
                value={config.conversationMemory}
                onChange={(e) => updateConfig('conversationMemory', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
          <CardDescription>
            Habilite ou desabilite recursos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'useEmojis', label: 'Usar Emojis 😊' },
              { key: 'canMakeJokes', label: 'Pode Fazer Piadas' },
              { key: 'canGiveAdvice', label: 'Pode Dar Conselhos' },
              { key: 'canRecommendProducts', label: 'Recomendar Produtos' },
              { key: 'useAnalogies', label: 'Usar Analogias' },
              { key: 'isActive', label: 'Agente Ativo' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={config[key as keyof AiAgentConfig] as boolean}
                  onCheckedChange={(checked) => updateConfig(key as keyof AiAgentConfig, checked)}
                />
                <Label htmlFor={key} className="cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mensagens Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mensagens Personalizadas
          </CardTitle>
          <CardDescription>
            Configure as mensagens automáticas do agente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Mensagem de Boas-Vindas</Label>
            <Textarea
              id="welcomeMessage"
              value={config.welcomeMessage}
              onChange={(e) => updateConfig('welcomeMessage', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayMessage">Mensagem de Ausente</Label>
            <Textarea
              id="awayMessage"
              value={config.awayMessage}
              onChange={(e) => updateConfig('awayMessage', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="errorMessage">Mensagem de Erro</Label>
            <Textarea
              id="errorMessage"
              value={config.errorMessage}
              onChange={(e) => updateConfig('errorMessage', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Restrições */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Restrições
          </CardTitle>
          <CardDescription>
            Configure tópicos e palavras bloqueadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockedTopics">Tópicos Bloqueados (separados por vírgula)</Label>
            <Textarea
              id="blockedTopics"
              placeholder="Ex: política, religião, assuntos pessoais"
              value={config.blockedTopics.join(', ')}
              onChange={(e) => updateBlockedTopics(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prohibitedWords">Palavras Proibidas (separadas por vírgula)</Label>
            <Textarea
              id="prohibitedWords"
              value={config.prohibitedWords.join(', ')}
              onChange={(e) => updateProhibitedWords(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="flex items-center gap-2"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={resetMutation.isPending}
          className="flex items-center gap-2"
        >
          {resetMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Restaurar Padrão
        </Button>
      </div>
    </div>
  );
}