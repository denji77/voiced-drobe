import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import { isAuthenticated, isAdmin, initializeBackendProducts } from "@/lib/api";
import { ThemeProvider } from "@/lib/theme-provider";

const queryClient = new QueryClient();

// Auth guard component for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  // Initialize backend with frontend products when app loads
  useEffect(() => {
    const initBackend = async () => {
      try {
        await initializeBackendProducts();
      } catch (error) {
        console.error("Failed to initialize backend:", error);
      }
    };
    
    initBackend();
  }, []);
  
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
