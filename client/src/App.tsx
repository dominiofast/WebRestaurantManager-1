import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import MenuManagement from "@/pages/MenuManagement";
import OrderManagement from "@/pages/OrderManagement";
import SuperAdmin from "@/pages/SuperAdmin";
import StoreManagement from "@/pages/StoreManagement";
import DigitalMenu from "@/pages/DigitalMenu";
import MenuManager from "@/pages/MenuManager";
import MenuIndex from "@/pages/MenuIndex";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/menu" component={MenuManagement} />
            <Route path="/orders" component={OrderManagement} />
            <Route path="/digital-menu" component={DigitalMenuManagement} />
            <Route path="/admin" component={SuperAdmin} />
            <Route path="/stores" component={StoreManagement} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-coral"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Rotas públicas do cardápio digital */}
      <Route path="/cardapios" component={MenuIndex} />
      <Route path="/menu/:storeSlug" component={DigitalMenu} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </>
      ) : (
        <Route path="/*?" component={AuthenticatedApp} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
