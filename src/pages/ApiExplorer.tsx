import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Save, History, Copy, Key } from "lucide-react";

const ApiExplorer = () => {
  const [request, setRequest] = useState({
    method: "GET",
    url: "/instance/info",
    headers: "{}",
    body: ""
  });

  const [response, setResponse] = useState({
    status: 200,
    data: '{\n  "instance": {\n    "name": "WhatsApp Business",\n    "status": "connected",\n    "phone": "+55 11 99999-9999"\n  }\n}',
    headers: '{\n  "content-type": "application/json",\n  "date": "Mon, 15 Jan 2024 10:30:00 GMT"\n}'
  });

  const endpoints = [
    { category: "Instância", path: "/instance/info", method: "GET", description: "Informações da instância" },
    { category: "Instância", path: "/instance/connect", method: "POST", description: "Conectar instância" },
    { category: "Instância", path: "/instance/qrcode", method: "GET", description: "Obter QR Code" },
    { category: "Mensagens", path: "/message/send", method: "POST", description: "Enviar mensagem" },
    { category: "Mensagens", path: "/message/send-media", method: "POST", description: "Enviar mídia" },
    { category: "Contatos", path: "/contact/list", method: "GET", description: "Listar contatos" },
    { category: "Grupos", path: "/group/create", method: "POST", description: "Criar grupo" },
    { category: "Webhook", path: "/webhook/set", method: "POST", description: "Configurar webhook" },
  ];

  const history = [
    { id: "1", method: "POST", path: "/message/send", status: 200, timestamp: "10:30:00" },
    { id: "2", method: "GET", path: "/instance/info", status: 200, timestamp: "10:25:00" },
    { id: "3", method: "GET", path: "/contact/list", status: 404, timestamp: "10:20:00" },
  ];

  const examples = {
    "/message/send": {
      method: "POST",
      body: '{\n  "number": "+5511999999999",\n  "message": "Olá! Como posso ajudar?"\n}'
    },
    "/message/send-media": {
      method: "POST", 
      body: '{\n  "number": "+5511999999999",\n  "mediaType": "image",\n  "media": "base64_string_here",\n  "caption": "Imagem enviada via API"\n}'
    },
    "/group/create": {
      method: "POST",
      body: '{\n  "name": "Grupo de Teste",\n  "participants": ["+5511999999999", "+5511888888888"]\n}'
    }
  };

  const loadExample = (path: string) => {
    const example = examples[path];
    if (example) {
      setRequest({
        ...request,
        method: example.method,
        url: path,
        body: example.body
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">API Explorer</h1>
          <p className="text-muted-foreground">Teste e explore os endpoints da Evolution API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {Object.entries(
                endpoints.reduce((acc, endpoint) => {
                  if (!acc[endpoint.category]) acc[endpoint.category] = [];
                  acc[endpoint.category].push(endpoint);
                  return acc;
                }, {} as Record<string, typeof endpoints>)
              ).map(([category, categoryEndpoints]) => (
                <div key={category}>
                  <div className="px-3 py-2 text-sm font-medium text-muted-foreground bg-muted/50">
                    {category}
                  </div>
                  {categoryEndpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-muted cursor-pointer border-b"
                      onClick={() => {
                        setRequest({
                          ...request,
                          method: endpoint.method,
                          url: endpoint.path
                        });
                        loadExample(endpoint.path);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={endpoint.method === "GET" ? "secondary" : "default"} className="text-xs">
                          {endpoint.method}
                        </Badge>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request/Response */}
        <div className="lg:col-span-3 space-y-6">
          {/* Configuração da Request */}
          <Card>
            <CardHeader>
              <CardTitle>Configurar Requisição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={request.method} onValueChange={(value) => setRequest({...request, method: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="/endpoint"
                  value={request.url}
                  onChange={(e) => setRequest({...request, url: e.target.value})}
                  className="flex-1"
                />
                <Button>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>

              <Tabs defaultValue="headers">
                <TabsList>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                </TabsList>
                
                <TabsContent value="headers" className="space-y-2">
                  <Label>Headers (JSON)</Label>
                  <Textarea
                    value={request.headers}
                    onChange={(e) => setRequest({...request, headers: e.target.value})}
                    placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                    rows={4}
                  />
                </TabsContent>
                
                <TabsContent value="body" className="space-y-2">
                  <Label>Request Body (JSON)</Label>
                  <Textarea
                    value={request.body}
                    onChange={(e) => setRequest({...request, body: e.target.value})}
                    placeholder='{"key": "value"}'
                    rows={6}
                  />
                </TabsContent>
                
                <TabsContent value="auth" className="space-y-4">
                  <div>
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Sua API Key" type="password" />
                      <Button variant="outline">
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Base URL</Label>
                    <Input defaultValue="https://api.evolution.com" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Resposta</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={response.status === 200 ? "default" : "destructive"}>
                    {response.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="response">
                <TabsList>
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="response-headers">Headers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response">
                  <Textarea
                    value={response.data}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                  />
                </TabsContent>
                
                <TabsContent value="response-headers">
                  <Textarea
                    value={response.headers}
                    readOnly
                    rows={6}
                    className="font-mono text-sm"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Requisições
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.method === "GET" ? "secondary" : "default"} className="text-xs">
                        {item.method}
                      </Badge>
                      <span className="font-mono text-sm">{item.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 200 ? "default" : "destructive"} className="text-xs">
                        {item.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiExplorer;