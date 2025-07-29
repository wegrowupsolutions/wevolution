import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, QrCode, Settings, Trash2, Activity, Copy, RefreshCw } from "lucide-react";
import { instanceService, type Instance, type InstanceConfig } from "@/services/InstanceService";
import { useApiKey, useWebhookEvents } from "@/hooks/useEvolutionAPI";

const Instances = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInstance, setNewInstance] = useState<InstanceConfig>({ 
    instanceName: "", 
    qrcode: true,
    webhook_by_events: true,
    events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
  });
  const { apiKey, updateApiKey } = useApiKey();
  const { connectionStatus, qrCode } = useWebhookEvents();
  // Carregar instâncias
  useEffect(() => {
    if (apiKey) {
      loadInstances();
    }
  }, [apiKey]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await instanceService.fetchInstances();
      setInstances(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar instâncias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    if (!newInstance.instanceName) {
      toast({
        title: "Erro",
        description: "Nome da instância é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      await instanceService.createInstance(newInstance);
      toast({
        title: "Sucesso",
        description: "Instância criada com sucesso"
      });
      setNewInstance({ 
        instanceName: "", 
        qrcode: true,
        webhook_by_events: true,
        events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
      });
      loadInstances();
    } catch (error) {
      toast({
        title: "Erro", 
        description: "Falha ao criar instância",
        variant: "destructive"
      });
    }
  };

  const deleteInstance = async (instanceName: string) => {
    try {
      await instanceService.deleteInstance(instanceName);
      toast({
        title: "Sucesso",
        description: "Instância deletada com sucesso"
      });
      loadInstances();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao deletar instância", 
        variant: "destructive"
      });
    }
  };

  const getQRCode = async (instanceName: string) => {
    try {
      const qrData = await instanceService.getQRCode(instanceName);
      // QR Code será exibido via webhook events
      toast({
        title: "QR Code",
        description: "QR Code solicitado, aguarde..."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao obter QR Code",
        variant: "destructive"
      });
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copiado",
      description: "API Key copiada para área de transferência"
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = connectionStatus[status] || status;
    switch (normalizedStatus) {
      case "open": 
      case "connected": return "default";
      case "connecting": return "secondary";
      case "close":
      case "disconnected": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = connectionStatus[status] || status;
    switch (normalizedStatus) {
      case "open":
      case "connected": return <Activity className="w-4 h-4 text-success" />;
      case "connecting": return <Activity className="w-4 h-4 text-warning animate-pulse" />;
      case "close":
      case "disconnected": return <Activity className="w-4 h-4 text-destructive" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!apiKey) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurar API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Evolution API Key</Label>
              <Input 
                type="password"
                placeholder="Digite sua API Key"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    updateApiKey(e.currentTarget.value);
                  }
                }}
              />
            </div>
            <Button 
              onClick={() => {
                const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (input?.value) {
                  updateApiKey(input.value);
                }
              }}
            >
              Salvar API Key
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full pl-2 pr-3 py-3 lg:pl-4 lg:pr-6 lg:py-6 space-y-4 lg:space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Gerenciamento de Instâncias</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Crie e gerencie suas conexões WhatsApp Business ({instances.length} instâncias)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadInstances} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
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
                  placeholder="Ex: whatsapp-business"
                  value={newInstance.instanceName}
                  onChange={(e) => setNewInstance({...newInstance, instanceName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="webhook">URL do Webhook (opcional)</Label>
                <Input
                  id="webhook"
                  placeholder="https://seu-n8n.com/webhook/evolution"
                  value={newInstance.webhook || ''}
                  onChange={(e) => setNewInstance({...newInstance, webhook: e.target.value})}
                />
              </div>
              <Button className="w-full" onClick={createInstance}>Criar Instância</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Card key={instance.instance.instanceName} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(instance.instance.status)}
                    {instance.instance.instanceName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Status: {connectionStatus[instance.instance.instanceName] || instance.instance.status}
                  </p>
                </div>
                <Badge variant={getStatusColor(instance.instance.status)}>
                  {connectionStatus[instance.instance.instanceName] || instance.instance.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {instance.hash?.apikey && (
                <div>
                  <Label className="text-xs text-muted-foreground">API Key</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      value={`${instance.hash.apikey.substring(0, 20)}...`} 
                      readOnly 
                      className="text-xs font-mono" 
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyApiKey(instance.hash!.apikey)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => getQRCode(instance.instance.instanceName)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteInstance(instance.instance.instanceName)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

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