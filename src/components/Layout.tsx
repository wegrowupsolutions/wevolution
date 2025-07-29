import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Webhook, 
  Settings, 
  Database,
  Menu,
  X,
  Activity,
  Zap,
  Bell
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Instâncias", href: "/instances", icon: Database },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Webhooks", href: "/webhooks", icon: Webhook },
    { name: "API Explorer", href: "/api-explorer", icon: Activity },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-sm border-r border-border/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                  Wevolution
                </span>
                <p className="text-xs text-muted-foreground">WhatsApp Platform</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto lg:hidden hover:bg-muted/50"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 custom-scrollbar overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    isActive ? "scale-110" : "group-hover:scale-105"
                  )} />
                  <span className="font-medium">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-border/50 p-4 mt-auto">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>Sistema Online</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Wevolution Platform v2.0</p>
                <p className="text-[10px]">Conecte suas aplicações ao n8n</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 transition-all duration-300">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 px-6 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-muted/50"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="flex-1" />

          {/* Status indicators */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1 px-2 py-1">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  3 instâncias
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="gap-1 px-2 py-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  2 webhooks
                </Badge>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="relative hover:bg-muted/50">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </Button>
            
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;