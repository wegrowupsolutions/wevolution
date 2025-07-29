import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useEvolutionConfig, type EvolutionConfig } from "@/hooks/useEvolutionConfig";
import { Settings, Zap } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { updateConfig } = useEvolutionConfig();
  
  const [formData, setFormData] = useState<EvolutionConfig>({
    serverUrl: "https://evolution.serverwegrowup.com.br",
    apiKey: "066327121bd64f8356c26e9edfa1799d",
    exposeInFetchInstances: true,
    delInstance: false,
    qrcodeLimit: 1902,
    qrcodeColor: "#175197",
    language: "pt-BR"
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serverUrl || !formData.apiKey) {
      toast({
        title: "Erro",
        description: "URL do servidor e API Key são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simular validação da conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateConfig(formData);
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao conectar. Verifique as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto border-border shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Wevolution</h1>
              <p className="text-sm text-muted-foreground">WhatsApp Platform</p>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Configuração Inicial</h2>
            <p className="text-muted-foreground">Configure sua Evolution API para começar</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Configurações Gerais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Configurações Gerais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverUrl" className="text-foreground">
                    Server URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serverUrl"
                    type="url"
                    value={formData.serverUrl}
                    onChange={(e) => setFormData({...formData, serverUrl: e.target.value})}
                    placeholder="https://evolution.serverwegrowup.com.br"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-foreground">
                    Authentication API Key <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="066327121bd64f8356c26e9edfa1799d"
                    className="bg-background border-border text-foreground"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qrcodeLimit" className="text-foreground">QR Code Limit</Label>
                  <Input
                    id="qrcodeLimit"
                    type="number"
                    value={formData.qrcodeLimit}
                    onChange={(e) => setFormData({...formData, qrcodeLimit: parseInt(e.target.value) || 1902})}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qrcodeColor" className="text-foreground">QR Code Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qrcodeColor"
                      type="color"
                      value={formData.qrcodeColor}
                      onChange={(e) => setFormData({...formData, qrcodeColor: e.target.value})}
                      className="w-16 h-10 bg-background border-border"
                    />
                    <Input
                      type="text"
                      value={formData.qrcodeColor}
                      onChange={(e) => setFormData({...formData, qrcodeColor: e.target.value})}
                      className="flex-1 bg-background border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-foreground">Idioma</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(value) => setFormData({...formData, language: value})}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español (España)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configurações Avançadas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Configurações Avançadas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between space-x-3">
                  <div className="space-y-1">
                    <Label className="text-foreground font-medium">
                      Expose in Fetch Instances
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Expor autenticação ao buscar instâncias
                    </p>
                  </div>
                  <Switch
                    checked={formData.exposeInFetchInstances}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, exposeInFetchInstances: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between space-x-3">
                  <div className="space-y-1">
                    <Label className="text-foreground font-medium">
                      Delete Instance
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir exclusão de instâncias
                    </p>
                  </div>
                  <Switch
                    checked={formData.delInstance}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, delInstance: checked})
                    }
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? "Conectando..." : "Conectar à Evolution API"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;