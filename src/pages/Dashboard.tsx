import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, MessageSquare, Webhook, Database, Plus, Settings, TrendingUp, Users, Zap } from "lucide-react";

const Dashboard = () => {
  const instances = [
    { id: "1", name: "WhatsApp Business", status: "connected", messages: 145, uptime: 99.8 },
    { id: "2", name: "Suporte Cliente", status: "disconnected", messages: 0, uptime: 0 },
    { id: "3", name: "Vendas Online", status: "connecting", messages: 23, uptime: 85.2 },
  ];

  const webhooks = [
    { id: "1", url: "https://api.example.com/webhook", events: ["message", "status"], active: true },
    { id: "2", url: "https://n8n.example.com/webhook", events: ["message"], active: false },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard Wevolution
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas integrações WhatsApp e n8n
          </p>
        </div>
        <Button className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Nova Instância
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Instâncias Ativas</CardTitle>
            <div className="p-2 bg-success/10 rounded-lg">
              <Activity className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              de 3 total configuradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mensagens Hoje</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">168</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12% desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Webhooks Ativos</CardTitle>
            <div className="p-2 bg-warning/10 rounded-lg">
              <Webhook className="h-5 w-5 text-warning" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">de 2 configurados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary-glow hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conexões API</CardTitle>
            <div className="p-2 bg-primary-glow/10 rounded-lg">
              <Zap className="h-5 w-5 text-primary-glow" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">247</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              requests hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          <CardContent className="p-6">
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-4 h-4 rounded-full ${
                        instance.status === 'connected' ? 'bg-success animate-pulse' :
                        instance.status === 'connecting' ? 'bg-warning animate-pulse' :
                        'bg-destructive'
                      }`} />
                      <div className="space-y-1">
                        <p className="font-medium text-lg">{instance.name}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{instance.messages} mensagens</span>
                          <span>Uptime: {instance.uptime}%</span>
                        </div>
                        <Progress value={instance.uptime} className="w-32 h-2" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={instance.status === "connected" ? "default" : 
                                instance.status === "connecting" ? "secondary" : "destructive"}
                        className="px-3 py-1"
                      >
                        {instance.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="hover:bg-muted">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
          <CardContent className="p-6">
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 rounded-xl border border-border/50 hover:border-primary/20 transition-all bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${webhook.active ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                        <p className="font-medium truncate text-lg">{webhook.url}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
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