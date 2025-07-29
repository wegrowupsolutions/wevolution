import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, MessageSquare, Webhook, Database, Plus, Settings } from "lucide-react";

const Dashboard = () => {
  const instances = [
    { id: "1", name: "Instance 1", status: "connected", messages: 145 },
    { id: "2", name: "Instance 2", status: "disconnected", messages: 0 },
    { id: "3", name: "Instance 3", status: "connecting", messages: 23 },
  ];

  const webhooks = [
    { id: "1", url: "https://api.example.com/webhook", events: ["message", "status"], active: true },
    { id: "2", url: "https://n8n.example.com/webhook", events: ["message"], active: false },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Evolution Platform Dashboard</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Instância
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instâncias Ativas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">de 3 total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">168</div>
            <p className="text-xs text-muted-foreground">+12% desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Webhooks Ativos</CardTitle>
            <Webhook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">de 2 configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões API</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">requests hoje</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Instâncias WhatsApp</CardTitle>
            <CardDescription>
              Gerencie suas conexões WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">{instance.name}</p>
                      <p className="text-sm text-muted-foreground">{instance.messages} mensagens</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={instance.status === "connected" ? "default" : "secondary"}>
                      {instance.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Webhooks Configurados</CardTitle>
            <CardDescription>
              Integre com n8n e outras plataformas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium truncate">{webhook.url}</p>
                    <p className="text-sm text-muted-foreground">
                      Eventos: {webhook.events.join(", ")}
                    </p>
                  </div>
                  <Badge variant={webhook.active ? "default" : "secondary"}>
                    {webhook.active ? "Ativo" : "Inativo"}
                  </Badge>
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