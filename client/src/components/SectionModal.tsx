import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: any;
  storeId: string;
}

export default function SectionModal({ isOpen, onClose, section, storeId }: SectionModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    displayOrder: 0
  });

  // Reset form when section changes
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name || "",
        description: section.description || "",
        displayOrder: section.displayOrder || 0
      });
    } else {
      setFormData({
        name: "",
        description: "",
        displayOrder: 0
      });
    }
  }, [section]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const url = section 
        ? `/api/stores/${storeId}/menu-sections/${section.id}`
        : `/api/stores/${storeId}/menu-sections`;
      
      const payload = {
        ...data,
        storeId: parseInt(storeId)
      };

      const response = await fetch(url, {
        method: section ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar seção');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${storeId}/menu-sections`] });
      toast({ 
        title: "Sucesso", 
        description: section ? "Seção atualizada!" : "Seção criada!" 
      });
      onClose();
    },
    onError: () => {
      toast({ 
        title: "Erro", 
        description: "Não foi possível salvar a seção",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "Nome da seção é obrigatório",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {section ? "Editar Seção" : "Nova Seção"}
          </DialogTitle>
          <DialogDescription>
            {section ? "Atualize as informações da seção" : "Adicione uma nova seção ao cardápio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Seção *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ex: Pizzas Doces"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descreva a seção..."
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : section ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}