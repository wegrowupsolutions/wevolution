import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, QrCode, Settings, Trash2, Activity, Copy, RefreshCw, Eye, EyeOff, MessageSquare } from "lucide-react";
import { integratedEvolutionService } from "@/services/IntegratedEvolutionService";
import { supabaseEvolutionService, type EvolutionInstance } from "@/services/SupabaseEvolutionService";
import { useAuth } from "@/hooks/useAuth";

const Instances = () => {
  const { user } = useAuth();
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [newInstance, setNewInstance] = useState({
    instanceName: "",
    apiUrl: "",
    apiKey: "",
    webhookUrl: `https://xzjzxckxaiwneybyduim.supabase.co/functions/v1/webhook-handler`,
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});

  // Carregar instâncias
  useEffect(() => {
    if (user) {
      loadInstances();
    }
  }, [user]);

  // Subscrever a atualizações em tempo real
  useEffect(() => {
    if (!user) return;

    const subscription = supabaseEvolutionService.subscribeToInstances((payload) => {
      console.log('Instance update:', payload);
      
      if (payload.eventType === 'UPDATE') {
        setInstances(prev => prev.map(instance => 
          instance.id === payload.new.id ? payload.new : instance
        ));
        
        // Atualizar QR code se disponível
        if (payload.new.qr_code) {
          setQrCodes(prev => ({
            ...prev,
            [payload.new.id]: payload.new.qr_code
          }));
        }
      } else if (payload.eventType === 'INSERT') {
        setInstances(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'DELETE') {
        setInstances(prev => prev.filter(instance => instance.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabaseEvolutionService.getInstances();
      
      if (error) {
        toast.error("Erro ao carregar instâncias: " + error.message);
        return;
      }
      
      setInstances(data || []);
    } catch (error) {
      console.error('Error loading instances:', error);
      toast.error("Falha ao carregar instâncias");
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    if (!newInstance.instanceName.trim()) {
      toast.error("Nome da instância é obrigatório");
      return;
    }

    if (!newInstance.apiKey.trim()) {
      toast.error("API Key é obrigatória");
      return;
    }

    if (!newInstance.apiUrl.trim()) {
      toast.error("URL da API é obrigatória");
      return;
    }

    try {
      setLoading(true);
      
      // Criar instância através do serviço integrado
      const result = await integratedEvolutionService.createInstance({
        instanceName: newInstance.instanceName,
        apiUrl: newInstance.apiUrl,
        apiKey: newInstance.apiKey,
        webhook: newInstance.webhookUrl,
        webhook_by_events: true,
        events: [
          'qrcode.updated',
          'connection.update', 
          'messages.upsert',
          'contacts.upsert'
        ]
      });

      toast.success("Instância criada com sucesso! Pronta para receber e enviar mensagens.");
      
      // Limpar formulário
      setNewInstance({
        instanceName: "",
        apiUrl: "",
        apiKey: "",
        webhookUrl: `https://xzjzxckxaiwneybyduim.supabase.co/functions/v1/webhook-handler`,
      });
      
      setIsDialogOpen(false);
      await loadInstances();
      
    } catch (error: any) {
      console.error('Error creating instance:', error);
      
      // Melhor tratamento de erro com mais detalhes
      let errorMessage = "Erro desconhecido";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Se é erro da Evolution API, mostrar detalhes específicos
      if (error.message?.includes('Evolution API error')) {
        errorMessage = `Erro da Evolution API: Verifique se a URL e API Key estão corretos. ${error.message}`;
      }
      
      // Se é erro de conectividade
      if (error.message?.includes('fetch')) {
        errorMessage = "Erro de conectividade: Verifique se a URL da Evolution API está acessível.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteInstance = async (instanceId: string) => {
    try {
      const { error } = await supabaseEvolutionService.deleteInstance(instanceId);
      
      if (error) {
        toast.error("Erro ao deletar instância: " + error.message);
        return;
      }
      
      toast.success("Instância deletada com sucesso");
      await loadInstances();
    } catch (error) {
      console.error('Error deleting instance:', error);
      toast.error("Falha ao deletar instância");
    }
  };

  const connectInstance = async (instanceId: string, apiKey: string) => {
    try {
      setConnecting(prev => ({ ...prev, [instanceId]: true }));
      
      const qrData = await integratedEvolutionService.connectInstance(instanceId, apiKey);
      
      if (qrData.base64) {
        setQrCodes(prev => ({ ...prev, [instanceId]: qrData.base64 }));
        toast.success("QR Code gerado! Escaneie para conectar.");
      }
      
    } catch (error: any) {
      console.error('Error connecting instance:', error);
      toast.error("Erro ao conectar instância: " + (error.message || "Erro desconhecido"));
    } finally {
      setConnecting(prev => ({ ...prev, [instanceId]: false }));
    }
  };

  const sendTestMessage = async (instanceId: string, apiKey: string) => {
    const phoneNumber = prompt("Digite o número para teste (com código do país, ex: 5511999999999):");
    if (!phoneNumber) return;

    try {
      await integratedEvolutionService.sendTextMessage(
        instanceId, 
        `${phoneNumber}@s.whatsapp.net`, 
        "🤖 Mensagem de teste do Evolution API Manager! Sua instância está funcionando perfeitamente.",
        apiKey
      );
      
      toast.success("Mensagem de teste enviada com sucesso!");
    } catch (error: any) {
      console.error('Error sending test message:', error);
      toast.error("Erro ao enviar mensagem: " + (error.message || "Erro desconhecido"));
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para área de transferência`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": 
      case "connected": return "bg-green-500";
      case "connecting": 
      case "qr_code": return "bg-yellow-500";
      case "close":
      case "disconnected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": 
      case "connected": return "Conectado";
      case "connecting": 
      case "qr_code": return "Conectando";
      case "close":
      case "disconnected": return "Desconectado";
      case "created": return "Criado";
      default: return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input 
            placeholder="Buscar instâncias..." 
            className="bg-background border-border"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={loadInstances}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Nova Instância
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Criar Nova Instância</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nome da Instância <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: minha-empresa"
                    value={newInstance.instanceName}
                    onChange={(e) => setNewInstance({...newInstance, instanceName: e.target.value})}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="apiUrl" className="text-foreground">
                    URL da Evolution API <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apiUrl"
                    placeholder="Ex: https://api.evolution-api.com"
                    value={newInstance.apiUrl}
                    onChange={(e) => setNewInstance({...newInstance, apiUrl: e.target.value})}
                    className="bg-background border-border text-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL base da sua instância Evolution API (sem /instance no final)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-foreground">
                    API Key <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Sua API Key da Evolution"
                      value={newInstance.apiKey}
                      onChange={(e) => setNewInstance({...newInstance, apiKey: e.target.value})}
                      className="bg-background border-border text-foreground pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Webhook URL (Automático)</Label>
                  <Input
                    value={newInstance.webhookUrl}
                    disabled
                    className="bg-muted border-border text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta URL será usada para receber eventos em tempo real
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createInstance}
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6"
                  >
                    {loading ? "Criando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma instância encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira instância para começar a enviar e receber mensagens
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Instância
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <Card key={instance.id} className="bg-card border-border">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-medium text-foreground">
                      {instance.instance_name}
                    </CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)}`}></div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(instance.status)}
                  </Badge>
                </div>
                
                {/* API Key display */}
                <div className="bg-muted/50 rounded px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground truncate">
                    {instance.api_key ? "••••••••••••••••••••••••••••••••••••••" : "API Key não configurada"}
                  </span>
                  <div className="flex gap-1">
                    {instance.api_key && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(instance.api_key!, "API Key")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* QR Code */}
                {qrCodes[instance.id] && (
                  <div className="flex justify-center p-4 bg-white rounded">
                    <img 
                      src={qrCodes[instance.id]} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                )}
                
                {/* Instance info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="text-foreground font-mono text-xs truncate ml-2">
                      {instance.api_url || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="text-foreground">
                      {instance.phone_number || "Não conectado"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Criado:</span>
                    <span className="text-foreground">
                      {new Date(instance.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {instance.status === 'created' && instance.api_key && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-blue-500/10 border-blue-500/20 text-blue-500 hover:bg-blue-500/20"
                      onClick={() => connectInstance(instance.id, instance.api_key!)}
                      disabled={connecting[instance.id]}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      {connecting[instance.id] ? "Conectando..." : "Conectar"}
                    </Button>
                  )}
                  
                  {instance.status === 'open' && instance.api_key && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20"
                      onClick={() => sendTestMessage(instance.id, instance.api_key!)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Teste
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja deletar esta instância?")) {
                        deleteInstance(instance.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Instances;