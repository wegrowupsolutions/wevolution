import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Image, Video, Mic, File, Phone, User } from "lucide-react";

const Chat = () => {
  const [selectedInstance, setSelectedInstance] = useState("");
  const [message, setMessage] = useState("");
  const [targetNumber, setTargetNumber] = useState("");

  const instances = [
    { id: "1", name: "WhatsApp Business", status: "connected" },
    { id: "2", name: "Suporte Cliente", status: "disconnected" },
  ];

  const recentMessages = [
    {
      id: "1",
      from: "+55 11 99999-9999",
      to: "+55 11 88888-8888",
      message: "Olá, tudo bem?",
      timestamp: "10:30",
      type: "received",
      status: "read"
    },
    {
      id: "2",
      from: "+55 11 88888-8888",
      to: "+55 11 99999-9999",
      message: "Oi! Tudo ótimo, e você?",
      timestamp: "10:32",
      type: "sent",
      status: "delivered"
    },
  ];

  const contacts = [
    { id: "1", name: "João Silva", phone: "+55 11 99999-9999", lastMessage: "Olá, tudo bem?", online: true },
    { id: "2", name: "Maria Santos", phone: "+55 11 88888-8888", lastMessage: "Obrigada!", online: false },
    { id: "3", name: "Pedro Costa", phone: "+55 11 77777-7777", lastMessage: "Até mais!", online: true },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Central de Mensagens</h1>
          <p className="text-muted-foreground">Envie e gerencie mensagens WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Contatos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Contatos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center p-3 hover:bg-muted cursor-pointer border-b">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chat</CardTitle>
              <Select value={selectedInstance} onValueChange={setSelectedInstance}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecionar instância" />
                </SelectTrigger>
                <SelectContent>
                  {instances.map((instance) => (
                    <SelectItem key={instance.id} value={instance.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${instance.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {instance.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Área de Mensagens */}
            <div className="h-96 border rounded-lg p-4 mb-4 overflow-y-auto bg-muted/20">
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${
                        msg.type === 'sent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <p>{msg.message}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs opacity-70">{msg.timestamp}</span>
                        {msg.type === 'sent' && (
                          <Badge variant="secondary" className="text-xs">
                            {msg.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Envio de Mensagem */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Número de destino (+55 11 99999-9999)"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                />
                <Button variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm">
                    <Image className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <File className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Button className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Presença */}
      <Card>
        <CardHeader>
          <CardTitle>Controle de Presença</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="outline">Marcar como Online</Button>
            <Button variant="outline">Marcar como Offline</Button>
            <Button variant="outline">Digitando...</Button>
            <Button variant="outline">Gravando Áudio</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;