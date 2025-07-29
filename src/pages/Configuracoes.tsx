import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvolutionConfig } from "@/hooks/useEvolutionConfig";
import { Settings, LogOut } from "lucide-react";

const Configuracoes = () => {
  const { config, clearConfig } = useEvolutionConfig();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da Evolution API
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações Atuais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Server URL</label>
                <p className="text-sm">{config.serverUrl}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">API Key</label>
                <p className="text-sm font-mono">
                  {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Não configurado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">QR Code Limit</label>
                <p className="text-sm">{config.qrcodeLimit}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">QR Code Color</label>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: config.qrcodeColor }}
                  />
                  <p className="text-sm">{config.qrcodeColor}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Idioma</label>
                <p className="text-sm">{config.language}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={clearConfig}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair e Reconfigurar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Configuracoes;