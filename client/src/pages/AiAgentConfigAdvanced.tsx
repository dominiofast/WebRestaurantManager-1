import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Brain, 
  MessageSquare, 
  Settings, 
  Shield, 
  TrendingUp, 
  Clock,
  Zap,
  Heart,
  Star,
  Target,
  Users,
  AlertTriangle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';

interface AiAgentConfig {
  storeId: number;
  name: string;
  description?: string;
  isActive: boolean;
  language: string;
  
  // Personality
  humorType: string;
  empathyLevel: number;
  formalityLevel: number;
  responseSpeed: string;
  
  // Technical
  maxTokens: number;
  temperature: number;
  conversationMemory: number;
  contextWindow: number;
  responseLatency: string;
  
  // AI Features
  useEmojis: boolean;
  canMakeJokes: boolean;
  canGiveAdvice: boolean;
  canRecommendProducts: boolean;
  useAnalogies: boolean;
  canDetectIntent: boolean;
  canDetectMood: boolean;
  canSuggestUpsell: boolean;
  canHandleComplaints: boolean;
  canScheduleOrders: boolean;
  useCustomerHistory: boolean;
  
  // Intelligence
  adaptivePersonality: boolean;
  learningEnabled: boolean;
  sentimentAnalysis: boolean;
  contextualResponses: boolean;
  multiLanguageDetection: boolean;
  
  // Messages
  welcomeMessage: string;
  awayMessage: string;
  errorMessage: string;
  busyMessage: string;
  thankYouMessage: string;
  goodbyeMessage: string;
  
  // Smart Templates
  orderConfirmationTemplate: string;
  deliveryUpdateTemplate: string;
  promotionTemplate: string;
  
  // Triggers
  autoGreetingEnabled: boolean;
  autoGreetingDelay: number;
  proactiveRecommendations: boolean;
  seasonalAdaptation: boolean;
  timeBasedResponses: boolean;
  
  // Sales
  upsellThreshold: number;
  crossSellEnabled: boolean;
  loyaltyIntegration: boolean;
  priceDiscussionAllowed: boolean;
  discountAuthorized: boolean;
  maxDiscountPercent: number;
  
  // Knowledge
  menuKnowledgeLevel: number;
  allergenAwareness: boolean;
  nutritionalInfo: boolean;
  preparationTimeAccuracy: boolean;
  ingredientSubstitutions: boolean;
  
  // Service
  complaintResolutionSteps: string;
  escalationTriggers: string[];
  serviceRecoveryEnabled: boolean;
  feedbackCollection: boolean;
  
  // Safety
  blockedTopics: string[];
  prohibitedWords: string[];
  contentModerationLevel: number;
  spamDetection: boolean;
}

export default function AiAgentConfigAdvanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<AiAgentConfig>({
    storeId: 0,
    name: "Assistente IA Avançado",
    description: "",
    isActive: true,
    language: "pt-BR",
    humorType: "profissional",
    empathyLevel: 7,
    formalityLevel: 5,
    responseSpeed: "moderada",
    maxTokens: 800,
    temperature: 0.7,
    conversationMemory: 15,
    contextWindow: 20,
    responseLatency: "instant",
    useEmojis: true,
    canMakeJokes: true,
    canGiveAdvice: true,
    canRecommendProducts: true,
    useAnalogies: true,
    canDetectIntent: true,
    canDetectMood: true,
    canSuggestUpsell: true,
    canHandleComplaints: true,
    canScheduleOrders: true,
    useCustomerHistory: true,
    adaptivePersonality: true,
    learningEnabled: true,
    sentimentAnalysis: true,
    contextualResponses: true,
    multiLanguageDetection: false,
    welcomeMessage: "Olá! Como posso ajudá-lo hoje?",
    awayMessage: "No momento estou ausente, mas retornarei em breve!",
    errorMessage: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
    busyMessage: "Estou com um volume alto de atendimentos. Aguarde um momento!",
    thankYouMessage: "Obrigado por entrar em contato conosco!",
    goodbyeMessage: "Foi um prazer ajudá-lo! Volte sempre!",
    orderConfirmationTemplate: "Pedido confirmado! Número: {orderNumber}. Tempo estimado: {estimatedTime} minutos.",
    deliveryUpdateTemplate: "Seu pedido está a caminho! Previsão de chegada: {estimatedArrival}.",
    promotionTemplate: "Temos uma oferta especial para você: {promotionDetails}",
    autoGreetingEnabled: true,
    autoGreetingDelay: 30,
    proactiveRecommendations: true,
    seasonalAdaptation: true,
    timeBasedResponses: true,
    upsellThreshold: 50.00,
    crossSellEnabled: true,
    loyaltyIntegration: false,
    priceDiscussionAllowed: true,
    discountAuthorized: false,
    maxDiscountPercent: 0,
    menuKnowledgeLevel: 9,
    allergenAwareness: true,
    nutritionalInfo: true,
    preparationTimeAccuracy: true,
    ingredientSubstitutions: true,
    complaintResolutionSteps: "1. Ouvir com empatia 2. Pedir desculpas 3. Oferecer solução 4. Confirmar satisfação",
    escalationTriggers: ["reclamação grave", "pedido de reembolso", "problema técnico"],
    serviceRecoveryEnabled: true,
    feedbackCollection: true,
    blockedTopics: ["política", "religião", "concorrentes"],
    prohibitedWords: [],
    contentModerationLevel: 5,
    spamDetection: true
  });

  const { data: agentData, isLoading } = useQuery({
    queryKey: ['/api/ai-agent'],
    staleTime: 0,
  });

  const saveMutation = useMutation({
    mutationFn: async (config: AiAgentConfig) => {
      const response = await fetch('/api/ai-agent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error('Falha ao salvar');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Configurações do agente IA salvas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent'] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (agentData) {
      setConfig(prev => ({ ...prev, ...agentData }));
    }
  }, [agentData]);

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const updateArrayField = (field: 'blockedTopics' | 'prohibitedWords' | 'escalationTriggers', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setConfig(prev => ({ ...prev, [field]: items }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuração Avançada do Agente IA</h1>
          <p className="text-gray-600">Configure seu assistente inteligente com recursos avançados</p>
        </div>
      </div>

      <Tabs defaultValue="personality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Personalidade
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Inteligência
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Conhecimento
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Aba Personalidade */}
        <TabsContent value="personality">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Assistente</Label>
                  <Input
                    id="name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Sofia IA"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={config.description || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva a função do seu assistente..."
                  />
                </div>

                <div>
                  <Label htmlFor="language">Idioma Principal</Label>
                  <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                      <SelectItem value="fr-FR">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Assistente Ativo</Label>
                  <Switch
                    id="isActive"
                    checked={config.isActive}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Traços de Personalidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Tipo de Humor</Label>
                  <Select value={config.humorType} onValueChange={(value) => setConfig(prev => ({ ...prev, humorType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="amigavel">Amigável</SelectItem>
                      <SelectItem value="divertido">Divertido</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Nível de Empatia: {config.empathyLevel}/10</Label>
                  <Slider
                    value={[config.empathyLevel]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, empathyLevel: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Nível de Formalidade: {config.formalityLevel}/10</Label>
                  <Slider
                    value={[config.formalityLevel]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, formalityLevel: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Velocidade de Resposta</Label>
                  <Select value={config.responseSpeed} onValueChange={(value) => setConfig(prev => ({ ...prev, responseSpeed: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rapida">Rápida</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="reflexiva">Reflexiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Inteligência */}
        <TabsContent value="intelligence">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configurações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tokens Máximos: {config.maxTokens}</Label>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, maxTokens: value }))}
                    max={2000}
                    min={100}
                    step={50}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Criatividade (Temperature): {config.temperature}</Label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, temperature: value }))}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Memória de Conversa: {config.conversationMemory} mensagens</Label>
                  <Slider
                    value={[config.conversationMemory]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, conversationMemory: value }))}
                    max={50}
                    min={5}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Janela de Contexto: {config.contextWindow}</Label>
                  <Slider
                    value={[config.contextWindow]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, contextWindow: value }))}
                    max={100}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recursos Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'canDetectIntent', label: 'Detectar Intenções', desc: 'Identifica o que o cliente quer' },
                  { key: 'canDetectMood', label: 'Detectar Humor', desc: 'Analisa o estado emocional' },
                  { key: 'sentimentAnalysis', label: 'Análise de Sentimento', desc: 'Avalia satisfação do cliente' },
                  { key: 'contextualResponses', label: 'Respostas Contextuais', desc: 'Considera o contexto da conversa' },
                  { key: 'adaptivePersonality', label: 'Personalidade Adaptativa', desc: 'Ajusta comportamento ao cliente' },
                  { key: 'learningEnabled', label: 'Aprendizado Contínuo', desc: 'Melhora com as interações' },
                  { key: 'useCustomerHistory', label: 'Histórico do Cliente', desc: 'Lembra interações anteriores' },
                  { key: 'multiLanguageDetection', label: 'Detecção Multi-idioma', desc: 'Identifica outros idiomas' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-sm text-gray-600">{feature.desc}</div>
                    </div>
                    <Switch
                      checked={config[feature.key as keyof AiAgentConfig] as boolean}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [feature.key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Mensagens */}
        <TabsContent value="messages">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens Padrão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcomeMessage">Mensagem de Boas-vindas</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="awayMessage">Mensagem de Ausência</Label>
                  <Textarea
                    id="awayMessage"
                    value={config.awayMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, awayMessage: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="errorMessage">Mensagem de Erro</Label>
                  <Textarea
                    id="errorMessage"
                    value={config.errorMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, errorMessage: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="busyMessage">Mensagem de Sistema Ocupado</Label>
                  <Textarea
                    id="busyMessage"
                    value={config.busyMessage}
                    onChange={(e) => setConfig(prev => ({ ...prev, busyMessage: e.target.value }))}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Templates Inteligentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orderConfirmationTemplate">Template de Confirmação de Pedido</Label>
                  <Textarea
                    id="orderConfirmationTemplate"
                    value={config.orderConfirmationTemplate}
                    onChange={(e) => setConfig(prev => ({ ...prev, orderConfirmationTemplate: e.target.value }))}
                    rows={2}
                    placeholder="Use {orderNumber}, {estimatedTime}"
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryUpdateTemplate">Template de Atualização de Entrega</Label>
                  <Textarea
                    id="deliveryUpdateTemplate"
                    value={config.deliveryUpdateTemplate}
                    onChange={(e) => setConfig(prev => ({ ...prev, deliveryUpdateTemplate: e.target.value }))}
                    rows={2}
                    placeholder="Use {estimatedArrival}"
                  />
                </div>

                <div>
                  <Label htmlFor="promotionTemplate">Template de Promoções</Label>
                  <Textarea
                    id="promotionTemplate"
                    value={config.promotionTemplate}
                    onChange={(e) => setConfig(prev => ({ ...prev, promotionTemplate: e.target.value }))}
                    rows={2}
                    placeholder="Use {promotionDetails}"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Comportamentos Automáticos</h4>
                  
                  <div className="flex items-center justify-between">
                    <Label>Saudação Automática</Label>
                    <Switch
                      checked={config.autoGreetingEnabled}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoGreetingEnabled: checked }))}
                    />
                  </div>

                  {config.autoGreetingEnabled && (
                    <div>
                      <Label>Delay da Saudação: {config.autoGreetingDelay}s</Label>
                      <Slider
                        value={[config.autoGreetingDelay]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, autoGreetingDelay: value }))}
                        max={300}
                        min={5}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Vendas */}
        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Inteligência de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Valor Mínimo para Upsell: R$ {config.upsellThreshold}</Label>
                  <Slider
                    value={[config.upsellThreshold]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, upsellThreshold: value }))}
                    max={200}
                    min={10}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sugerir Produtos Relacionados</Label>
                  <Switch
                    checked={config.crossSellEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, crossSellEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Discussão de Preços</Label>
                  <Switch
                    checked={config.priceDiscussionAllowed}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, priceDiscussionAllowed: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Autorizar Descontos</Label>
                  <Switch
                    checked={config.discountAuthorized}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, discountAuthorized: checked }))}
                  />
                </div>

                {config.discountAuthorized && (
                  <div>
                    <Label>Desconto Máximo: {config.maxDiscountPercent}%</Label>
                    <Slider
                      value={[config.maxDiscountPercent]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, maxDiscountPercent: value }))}
                      max={50}
                      min={0}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recursos de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'canSuggestUpsell', label: 'Sugerir Upsell', desc: 'Recomenda itens premium' },
                  { key: 'canRecommendProducts', label: 'Recomendar Produtos', desc: 'Sugere produtos baseado no perfil' },
                  { key: 'proactiveRecommendations', label: 'Recomendações Proativas', desc: 'Oferece produtos sem ser perguntado' },
                  { key: 'seasonalAdaptation', label: 'Adaptação Sazonal', desc: 'Ajusta ofertas conforme época' },
                  { key: 'timeBasedResponses', label: 'Respostas por Horário', desc: 'Muda ofertas conforme horário' },
                  { key: 'canScheduleOrders', label: 'Agendar Pedidos', desc: 'Permite agendamento futuro' },
                  { key: 'loyaltyIntegration', label: 'Integração com Fidelidade', desc: 'Reconhece clientes VIP' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{feature.label}</div>
                      <div className="text-sm text-gray-600">{feature.desc}</div>
                    </div>
                    <Switch
                      checked={config[feature.key as keyof AiAgentConfig] as boolean}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [feature.key]: checked }))}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Conhecimento */}
        <TabsContent value="knowledge">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Base de Conhecimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nível de Conhecimento do Menu: {config.menuKnowledgeLevel}/10</Label>
                  <Slider
                    value={[config.menuKnowledgeLevel]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, menuKnowledgeLevel: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'allergenAwareness', label: 'Consciência de Alérgenos', desc: 'Conhece ingredientes alergênicos' },
                    { key: 'nutritionalInfo', label: 'Informações Nutricionais', desc: 'Fornece dados nutricionais' },
                    { key: 'preparationTimeAccuracy', label: 'Tempo de Preparo Preciso', desc: 'Informa tempos realistas' },
                    { key: 'ingredientSubstitutions', label: 'Substituições de Ingredientes', desc: 'Sugere alternativas' },
                    { key: 'canGiveAdvice', label: 'Dar Conselhos', desc: 'Oferece orientações gastronômicas' },
                    { key: 'useAnalogies', label: 'Usar Analogias', desc: 'Explica com comparações' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-sm text-gray-600">{feature.desc}</div>
                      </div>
                      <Switch
                        checked={config[feature.key as keyof AiAgentConfig] as boolean}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [feature.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Excelência no Atendimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="complaintResolutionSteps">Passos para Resolver Reclamações</Label>
                  <Textarea
                    id="complaintResolutionSteps"
                    value={config.complaintResolutionSteps}
                    onChange={(e) => setConfig(prev => ({ ...prev, complaintResolutionSteps: e.target.value }))}
                    rows={3}
                    placeholder="1. Ouvir... 2. Pedir desculpas... 3. Oferecer solução..."
                  />
                </div>

                <div>
                  <Label htmlFor="escalationTriggers">Gatilhos de Escalação (separados por vírgula)</Label>
                  <Input
                    id="escalationTriggers"
                    value={config.escalationTriggers.join(', ')}
                    onChange={(e) => updateArrayField('escalationTriggers', e.target.value)}
                    placeholder="reclamação grave, pedido de reembolso, problema técnico"
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'canHandleComplaints', label: 'Gerenciar Reclamações', desc: 'Lida com insatisfações' },
                    { key: 'serviceRecoveryEnabled', label: 'Recuperação de Serviço', desc: 'Tenta reconquistar cliente' },
                    { key: 'feedbackCollection', label: 'Coletar Feedback', desc: 'Solicita avaliações' },
                    { key: 'canMakeJokes', label: 'Fazer Piadas', desc: 'Usa humor adequado' },
                    { key: 'useEmojis', label: 'Usar Emojis', desc: 'Adiciona expressões visuais' }
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{feature.label}</div>
                        <div className="text-sm text-gray-600">{feature.desc}</div>
                      </div>
                      <Switch
                        checked={config[feature.key as keyof AiAgentConfig] as boolean}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, [feature.key]: checked }))}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba Segurança */}
        <TabsContent value="safety">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Moderação de Conteúdo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Nível de Moderação: {config.contentModerationLevel}/10</Label>
                  <Slider
                    value={[config.contentModerationLevel]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, contentModerationLevel: value }))}
                    max={10}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    1 = Liberal, 10 = Muito Restrito
                  </div>
                </div>

                <div>
                  <Label htmlFor="blockedTopics">Tópicos Bloqueados (separados por vírgula)</Label>
                  <Input
                    id="blockedTopics"
                    value={config.blockedTopics.join(', ')}
                    onChange={(e) => updateArrayField('blockedTopics', e.target.value)}
                    placeholder="política, religião, concorrentes"
                  />
                </div>

                <div>
                  <Label htmlFor="prohibitedWords">Palavras Proibidas (separadas por vírgula)</Label>
                  <Input
                    id="prohibitedWords"
                    value={config.prohibitedWords.join(', ')}
                    onChange={(e) => updateArrayField('prohibitedWords', e.target.value)}
                    placeholder="palavrão1, palavrão2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Detecção de Spam</Label>
                  <Switch
                    checked={config.spamDetection}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, spamDetection: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Diretrizes de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Recomendações de Segurança</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Evite tópicos sensíveis como política e religião</li>
                    <li>• Configure moderação adequada para seu público</li>
                    <li>• Mantenha listas de palavras proibidas atualizadas</li>
                    <li>• Ative detecção de spam em ambientes públicos</li>
                    <li>• Revise periodicamente as interações</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Status da Configuração</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Moderação ativa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-700">Tópicos bloqueados configurados</span>
                    </div>
                    {config.spamDetection && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Detecção de spam ativa</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saveMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}