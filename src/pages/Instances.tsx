import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, QrCode, Settings, Trash2, Activity, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { instanceService, type Instance, type InstanceConfig } from "@/services/InstanceService";
import { useApiKey, useWebhookEvents } from "@/hooks/useEvolutionAPI";

const Instances = () => {
  // Mock data para demonstração
  const mockInstances = [
    {
      instance: { instanceName: "AFILIADO", status: "connected" },
      hash: { apikey: "5E9F056FE441-4F5E-A277-85DAB55D97C5" },
      profile: { name: "Afiliado IA", phone: "5511965788543" },
      stats: { messages: "1.561", contacts: "1.102" }
    },
    {
      instance: { instanceName: "teste1146", status: "connected" },
      hash: { apikey: "7F2A123BC567-8D9E-F012-34AB56CD78EF" },
      profile: { name: "Pet shop paradise", phone: "5511910362476" },
      stats: { messages: "82", contacts: "3.178" }
    }
  ];

  const [instances, setInstances] = useState<any[]>(mockInstances);
  const [loading, setLoading] = useState(false);
  const [newInstance, setNewInstance] = useState<InstanceConfig>({ 
    instanceName: "", 
    qrcode: true,
    webhook_by_events: true,
    events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE"]
  });
  const [channel, setChannel] = useState("baileys");
  const [token, setToken] = useState("5E9F056FE441-4F5E-A277-85DAB55D97C5");
  const [number, setNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showToken, setShowToken] = useState(false);
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

  // Sempre mostrar o layout principal, API Key é configurada dentro da página
  return (
    <div className="p-6 space-y-6">
      {/* Header com busca e botão */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input 
            placeholder="Search" 
            className="bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                Instance +
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">New instance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newInstance.instanceName}
                    onChange={(e) => setNewInstance({...newInstance, instanceName: e.target.value})}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Channel</Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="baileys">Baileys</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token" className="text-foreground">
                    Token <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="token"
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="bg-background border-border text-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number" className="text-foreground">Number</Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={createInstance}
                    className="bg-primary text-primary-foreground px-6"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Status</span>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <Card key={instance.instance.instanceName} className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium text-foreground">
                  {instance.instance.instanceName}
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              
              {/* Token display */}
              <div className="bg-muted/50 rounded px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-mono text-muted-foreground">
                  •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Profile info */}
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                   <span className="text-sm font-medium">
                     {instance.profile?.name?.charAt(0) || instance.instance.instanceName.charAt(0)}
                   </span>
                 </div>
                 <div className="flex-1">
                   <p className="font-medium text-foreground">{instance.profile?.name || 'Usuario'}</p>
                   <p className="text-sm text-muted-foreground">{instance.profile?.phone || 'N/A'}</p>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1">
                     <span className="text-sm text-muted-foreground">{instance.stats?.messages || '0'}</span>
                     <span className="text-xs text-muted-foreground">{instance.stats?.contacts || '0'}</span>
                   </div>
                 </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                >
                  Connected
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                  onClick={() => deleteInstance(instance.instance.instanceName)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Seção de configuração da API Key se não estiver configurada */}
      {!apiKey && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Configurar API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-foreground">Evolution API Key</Label>
              <Input 
                type="password"
                placeholder="Digite sua API Key"
                className="bg-background border-border text-foreground"
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
              className="bg-primary text-primary-foreground"
            >
              Salvar API Key
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Instances;