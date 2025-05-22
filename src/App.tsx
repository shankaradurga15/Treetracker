import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Trees from "./pages/Trees";
import Volunteer from "./pages/Volunteer";
import Inspection from "./pages/Inspection";
import NotFound from "./pages/NotFound";
import "leaflet/dist/leaflet.css";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen bg-muted text-foreground">
          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div className="flex-1 p-6 lg:p-10 bg-background overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trees" element={<Trees />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/inspection" element={<Inspection />} />
              {/* More routes can go here */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
