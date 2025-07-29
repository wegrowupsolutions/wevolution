import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, Webhook, Plus, Settings, TrendingUp, Users, Zap } from "lucide-react";
import { instanceService, type Instance } from "@/services/InstanceService";
import { useApiKey, useWebhookEvents } from "@/hooks/useEvolutionAPI";

const Dashboard = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiKey } = useApiKey();
  const { connectionStatus } = useWebhookEvents();

  useEffect(() => {
    if (apiKey) {
      loadData();
    }
  }, [apiKey]);

  const loadData = async () => {
    try {
      setLoading(true);
      const instanceData = await instanceService.fetchInstances();
      setInstances(instanceData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectedInstances = instances.filter(instance => 
    connectionStatus[instance.instance.instanceName] === 'open' || 
    instance.instance.status === 'connected'
  ).length;

  const totalWebhooks = instances.filter(instance => instance.webhook).length;

  const webhooks = [
    { id: "1", url: "https://api.example.com/webhook", events: ["message", "status"], active: true },
    { id: "2", url: "https://n8n.example.com/webhook", events: ["message"], active: false },
  ];

  if (!apiKey) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>API Key Necessária</CardTitle>
            <CardDescription>
              Configure sua Evolution API Key na página de Instâncias para ver o dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full pl-2 pr-3 py-3 lg:pl-4 lg:pr-6 lg:py-6 space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Wevolution
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Gerencie suas integrações WhatsApp e n8n
          </p>
        </div>
        <Button className="w-full md:w-auto shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Nova Instância
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="border-l-4 border-l-success hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Instâncias Ativas</CardTitle>
            <div className="p-1 lg:p-2 bg-success/10 rounded-lg">
              <Activity className="h-4 w-4 lg:h-5 lg:w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{connectedInstances}</div>
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden lg:inline">de {instances.length} total configuradas</span>
              <span className="lg:hidden">{instances.length} total</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Mensagens Hoje</CardTitle>
            <div className="p-1 lg:p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Webhooks Ativos</CardTitle>
            <div className="p-1 lg:p-2 bg-warning/10 rounded-lg">
              <Webhook className="h-4 w-4 lg:h-5 lg:w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">{totalWebhooks}</div>
            <p className="text-xs text-muted-foreground">de {instances.length} configurados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-glow hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs lg:text-sm font-medium text-muted-foreground">Conexões API</CardTitle>
            <div className="p-1 lg:p-2 bg-primary-glow/10 rounded-lg">
              <Zap className="h-4 w-4 lg:h-5 lg:w-5 text-primary-glow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl lg:text-3xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" />
              Instâncias WhatsApp
            </CardTitle>
            <CardDescription className="text-base">
              Gerencie suas conexões WhatsApp Business em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Activity className="w-6 h-6 animate-spin" />
                </div>
              ) : instances.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  <p>Nenhuma instância encontrada</p>
                  <p className="text-xs">Crie sua primeira instância para começar</p>
                </div>
              ) : (
                instances.slice(0, 3).map((instance) => {
                  const status = connectionStatus[instance.instance.instanceName] || instance.instance.status;
                  const isConnected = status === 'open' || status === 'connected';
                  
                  return (
                    <div key={instance.instance.instanceName} className="p-3 lg:p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all bg-muted/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${
                            isConnected ? 'bg-success animate-pulse' :
                            status === 'connecting' ? 'bg-warning animate-pulse' :
                            'bg-destructive'
                          }`} />
                          <div className="space-y-1">
                            <p className="font-medium text-sm lg:text-lg">{instance.instance.instanceName}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs lg:text-sm text-muted-foreground">
                              <span>Status: {status}</span>
                              {instance.webhook && <span>Webhook: Ativo</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={isConnected ? "default" : 
                                    status === "connecting" ? "secondary" : "destructive"}
                            className="px-3 py-1"
                          >
                            {status}
                          </Badge>
                          <Button variant="outline" size="sm" className="hover:bg-muted">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Webhook className="w-6 h-6 text-primary" />
              Webhooks Configurados
            </CardTitle>
            <CardDescription className="text-base">
              Integre com n8n e outras plataformas em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-3 lg:p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                        <p className="font-medium truncate text-sm lg:text-lg">{webhook.url}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs lg:text-sm text-muted-foreground">
                          Eventos: {webhook.events.join(", ")}
                        </p>
                        <div className="flex gap-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={webhook.active ? "default" : "secondary"}
                      className="ml-4 px-3 py-1"
                    >
                      {webhook.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;