import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Webhook, Activity, Settings, Trash2, Send } from "lucide-react";

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState([
    {
      id: "1",
      name: "N8N Integration",
      url: "https://n8n.example.com/webhook/evolution",
      events: ["message", "status"],
      active: true,
      instance: "1",
      lastTrigger: "2024-01-15 10:30:00"
    },
    {
      id: "2",
      name: "CRM Integration",
      url: "https://crm.example.com/api/webhook",
      events: ["message"],
      active: false,
      instance: "2",
      lastTrigger: "2024-01-14 15:45:00"
    },
  ]);

  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [],
    instance: "",
    active: true
  });

  const availableEvents = [
    { id: "message", label: "Mensagens", description: "Novas mensagens recebidas" },
    { id: "status", label: "Status", description: "Mudanças de status da instância" },
    { id: "presence", label: "Presença", description: "Mudanças de presença (online/offline)" },
    { id: "qrcode", label: "QR Code", description: "Geração de novo QR Code" },
    { id: "connection", label: "Conexão", description: "Status da conexão WhatsApp" },
  ];

  const instances = [
    { id: "1", name: "WhatsApp Business" },
    { id: "2", name: "Suporte Cliente" },
  ];

  const recentEvents = [
    {
      id: "1",
      webhook: "N8N Integration",
      event: "message",
      timestamp: "2024-01-15 10:30:00",
      status: "success",
      response: "200 OK"
    },
    {
      id: "2",
      webhook: "CRM Integration",
      event: "status",
      timestamp: "2024-01-15 10:25:00",
      status: "failed",
      response: "404 Not Found"
    },
  ];

  return (
    <div className="container mx-auto px-6 py-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Webhooks</h1>
          <p className="text-muted-foreground">Configure integrações com n8n e outras plataformas</p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurar Novo Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Webhook</Label>
                  <Input
                    id="name"
                    placeholder="Ex: N8N Integration"
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="instance">Instância</Label>
                  <Select value={newWebhook.instance} onValueChange={(value) => setNewWebhook({...newWebhook, instance: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar instância" />
                    </SelectTrigger>
                    <SelectContent>
                      {instances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>
                          {instance.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="url">URL do Webhook</Label>
                <Input
                  id="url"
                  placeholder="https://n8n.example.com/webhook/evolution"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                />
              </div>

              <div>
                <Label>Eventos para Escutar</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={newWebhook.events.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewWebhook({
                              ...newWebhook,
                              events: [...newWebhook.events, event.id]
                            });
                          } else {
                            setNewWebhook({
                              ...newWebhook,
                              events: newWebhook.events.filter(e => e !== event.id)
                            });
                          }
                        }}
                      />
                      <div>
                        <Label htmlFor={event.id} className="text-sm font-medium">
                          {event.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newWebhook.active}
                  onCheckedChange={(checked) => setNewWebhook({...newWebhook, active: checked})}
                />
                <Label>Webhook Ativo</Label>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Criar Webhook</Button>
                <Button variant="outline">Testar Webhook</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Webhooks */}
        <div className="lg:col-span-2 space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="w-5 h-5" />
                      {webhook.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">{webhook.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={webhook.active ? "default" : "secondary"}>
                      {webhook.active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Eventos</Label>
                    <div className="flex gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Último trigger:</span>
                    <span>{webhook.lastTrigger}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Testar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="w-4 h-4 mr-2" />
                      Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Eventos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {recentEvents.map((event) => (
                <div key={event.id} className="p-3 border-b">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-sm">{event.webhook}</p>
                    <Badge variant={event.status === "success" ? "default" : "destructive"} className="text-xs">
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Evento: {event.event}</p>
                  <p className="text-xs text-muted-foreground">Resposta: {event.response}</p>
                  <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Timeout (segundos)</Label>
              <Input type="number" defaultValue="30" />
            </div>
            <div>
              <Label>Tentativas de Retry</Label>
              <Input type="number" defaultValue="3" />
            </div>
          </div>
          
          <div>
            <Label>Headers Customizados (JSON)</Label>
            <Textarea
              placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch defaultChecked />
            <Label>Logs Detalhados</Label>
          </div>

          <Button>Salvar Configurações</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Webhooks;