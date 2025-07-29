import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, QrCode, Settings, Trash2, Activity } from "lucide-react";

const Instances = () => {
  const [instances, setInstances] = useState([
    { 
      id: "1", 
      name: "WhatsApp Business", 
      status: "connected", 
      phone: "+55 11 99999-9999",
      apiKey: "evo_api_key_123456",
      createdAt: "2024-01-15"
    },
    { 
      id: "2", 
      name: "Suporte Cliente", 
      status: "disconnected", 
      phone: "+55 11 88888-8888",
      apiKey: "evo_api_key_789012",
      createdAt: "2024-01-20"
    },
  ]);

  const [newInstance, setNewInstance] = useState({ name: "", phone: "" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "default";
      case "connecting": return "secondary";
      case "disconnected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <Activity className="w-4 h-4 text-green-500" />;
      case "connecting": return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case "disconnected": return <Activity className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Instâncias</h1>
          <p className="text-muted-foreground">Crie e gerencie suas conexões WhatsApp Business</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Instância</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Instância</Label>
                <Input
                  id="name"
                  placeholder="Ex: WhatsApp Vendas"
                  value={newInstance.name}
                  onChange={(e) => setNewInstance({...newInstance, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  placeholder="+55 11 99999-9999"
                  value={newInstance.phone}
                  onChange={(e) => setNewInstance({...newInstance, phone: e.target.value})}
                />
              </div>
              <Button className="w-full">Criar Instância</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Card key={instance.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(instance.status)}
                    {instance.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{instance.phone}</p>
                </div>
                <Badge variant={getStatusColor(instance.status)}>
                  {instance.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={instance.apiKey} 
                    readOnly 
                    className="text-xs font-mono" 
                  />
                  <Button variant="outline" size="sm">
                    Copiar
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Criado em: {instance.createdAt}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Base URL da API</Label>
            <Input value="https://api.evolution.com" readOnly />
          </div>
          <div>
            <Label>Webhook Base URL</Label>
            <Input placeholder="https://seu-webhook.com/evolution" />
          </div>
          <div className="flex space-x-2">
            <Button>Salvar Configurações</Button>
            <Button variant="outline">Testar Conexão</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Instances;