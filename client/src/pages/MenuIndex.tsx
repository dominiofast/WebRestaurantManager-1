import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  MapPin, 
  Star,
  Search,
  ExternalLink
} from "lucide-react";

// Lista das lojas com cardápios disponíveis (dados reais do banco)
const availableStores = [
  {
    id: 1,
    name: "FastFood Shopping Morumbi",
    slug: "fastfood-morumbi",
    description: "Os melhores hambúrguers artesanais da região",
    address: "Shopping Morumbi, Piso L3, Loja 312",
    estimatedDeliveryTime: "25-35 min",
    deliveryFee: "R$ 5,90",
    minimumOrder: "R$ 25,00",
    rating: 4.8,
    category: "Fast Food",
    isOpen: true,
    company: "Rede FastFood Brasil"
  },
  {
    id: 4,
    name: "Pizzaria Copacabana",
    slug: "pizzaria-copacabana",
    description: "Pizzas tradicionais italianas no coração de Copacabana",
    address: "Rua Barata Ribeiro, 502 - Copacabana",
    estimatedDeliveryTime: "35-45 min",
    deliveryFee: "R$ 8,90",
    minimumOrder: "R$ 40,00",
    rating: 4.9,
    category: "Pizzaria",
    isOpen: true,
    company: "Pizzaria Italiana Network"
  },
  {
    id: 7,
    name: "Cafeteria Savassi",
    slug: "cafeteria-savassi",
    description: "Cafés especiais e doces artesanais",
    address: "Rua Pernambuco, 1200 - Savassi",
    estimatedDeliveryTime: "15-25 min",
    deliveryFee: "R$ 3,90",
    minimumOrder: "R$ 15,00",
    rating: 4.7,
    category: "Cafeteria",
    isOpen: true,
    company: "Cafeteria Premium Group"
  },
  {
    id: 10,
    name: "Hamburgueria Premium - Augusta",
    slug: "hamburgueria-premium-augusta",
    description: "Hambúrguers gourmet artesanais com ingredientes premium",
    address: "Rua Augusta, 1234 - Consolação, São Paulo - SP",
    estimatedDeliveryTime: "20-30 min",
    deliveryFee: "R$ 6,90",
    minimumOrder: "R$ 30,00",
    rating: 4.9,
    category: "Hamburgueria Gourmet",
    isOpen: true,
    company: "Hamburgueria Premium"
  }
];

export default function MenuIndex() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = availableStores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DomínioMenu.AI
            </h1>
            <p className="text-gray-600 mb-6">
              Descubra os melhores restaurantes e faça seus pedidos online
            </p>
            
            {/* Barra de pesquisa */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar restaurantes ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de restaurantes */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Restaurantes Disponíveis
          </h2>
          <p className="text-gray-600">
            {filteredStores.length} restaurante{filteredStores.length !== 1 ? 's' : ''} encontrado{filteredStores.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      {store.isOpen ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Aberto
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          Fechado
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm mb-2">
                      {store.description}
                    </CardDescription>
                    <div className="text-xs text-gray-500">
                      {store.company} • {store.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-yellow-600 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{store.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{store.estimatedDeliveryTime}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Taxa: </span>
                    <span className="font-medium">{store.deliveryFee}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Pedido mínimo: <span className="font-medium">{store.minimumOrder}</span>
                  </div>
                  
                  <Link href={`/menu/${store.slug}`}>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Cardápio
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum restaurante encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar sua pesquisa ou explore outras categorias
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 DomínioMenu.AI - Sistema de Gestão e Cardápios Digitais</p>
          </div>
        </div>
      </footer>
    </div>
  );
}