import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, Shield, Camera, Save, AlertCircle, CheckCircle, Store, Image } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import { queryClient } from "@/lib/queryClient";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para dados do perfil
  const [profileData, setProfileData] = useState({
    name: user?.ownerName || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    avatar: "",
    position: "Gerente"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromotions: false,
    smsOrders: true,
    pushNotifications: true
  });

  const [storeSettings, setStoreSettings] = useState({
    logoUrl: "",
    bannerUrl: ""
  });

  // Fetch manager's store info
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['/api/manager/store'],
  });

  // Update store settings quando a loja for carregada
  useEffect(() => {
    if (store) {
      setStoreSettings({
        logoUrl: (store as any).logoUrl || "",
        bannerUrl: (store as any).bannerUrl || ""
      });
    }
  }, [store]);

  // Mutation para salvar configurações da loja
  const updateStoreMutation = useMutation({
    mutationFn: async (storeData: any) => {
      const response = await fetch(`/api/stores/${store?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeData),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar loja');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/manager/store'] });
      toast({
        title: "Configurações salvas",
        description: "As imagens da loja foram atualizadas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações da loja.",
        variant: "destructive"
      });
    }
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Perfil atualizado",
      description: "Seus dados foram salvos com sucesso.",
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                <p className="text-gray-600">Gerencie suas informações pessoais e configurações</p>
              </div>
            </div>
            {store && (
              <div className="text-right">
                <p className="font-medium text-gray-900">{store.name}</p>
                <p className="text-sm text-gray-500">{store.company?.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar com Avatar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                      {profileData.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="relative">
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        console.log("Arquivo selecionado:", e.target.files?.[0]);
                      }}
                    />
                  </Button>
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{profileData.position}</span>
                  </div>
                  {store && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{store.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados Pessoais
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notificações
                </TabsTrigger>
              </TabsList>

              {/* Dados Pessoais */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                    <CardDescription>
                      Atualize seus dados pessoais e informações de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="seu-email@exemplo.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          value={profileData.position}
                          onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                          placeholder="Sua função na empresa"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Conte um pouco sobre você..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleProfileUpdate}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Segurança */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Segurança da Conta</CardTitle>
                    <CardDescription>
                      Altere sua senha e configure opções de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Senha Atual</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Digite sua senha atual"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nova Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Digite sua nova senha"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirme sua nova senha"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Dicas de Segurança:</h4>
                          <ul className="text-sm text-blue-700 mt-1 space-y-1">
                            <li>• Use pelo menos 8 caracteres</li>
                            <li>• Combine letras maiúsculas e minúsculas</li>
                            <li>• Inclua números e símbolos</li>
                            <li>• Não use informações pessoais</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handlePasswordChange}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notificações */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências de Notificação</CardTitle>
                    <CardDescription>
                      Configure quando e como você deseja receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Pedidos por E-mail</Label>
                          <p className="text-sm text-gray-500">
                            Receba notificações de novos pedidos por e-mail
                          </p>
                        </div>
                        <Switch
                          checked={notifications.emailOrders}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, emailOrders: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Promoções por E-mail</Label>
                          <p className="text-sm text-gray-500">
                            Receba ofertas especiais e novidades
                          </p>
                        </div>
                        <Switch
                          checked={notifications.emailPromotions}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, emailPromotions: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Pedidos por SMS</Label>
                          <p className="text-sm text-gray-500">
                            Notificações urgentes de pedidos via SMS
                          </p>
                        </div>
                        <Switch
                          checked={notifications.smsOrders}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, smsOrders: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Notificações Push</Label>
                          <p className="text-sm text-gray-500">
                            Notificações em tempo real no navegador
                          </p>
                        </div>
                        <Switch
                          checked={notifications.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                          }
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-900">Configurações Salvas</h4>
                          <p className="text-sm text-green-700">
                            Suas preferências de notificação foram atualizadas automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}