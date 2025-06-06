import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Trees from "./pages/Trees";
import Volunteer from "./pages/Volunteer";
// import UsersPage from './pages/users';
import Inspection from "./pages/Inspection";
import NotFound from "./pages/NotFound";
import Master from "./pages/master";
import "leaflet/dist/leaflet.css";
import TreetrackerLanding from './pages/TreetrackerLanding';
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<TreetrackerLanding />} />
             <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/trees" element={<Trees />} />
              <Route path="/volunteer" element={<Volunteer />} />
              <Route path="/inspection" element={<Inspection />} />
              {/* <Route path="/users" element={<UsersPage />} /> */}
              <Route path="/master" element={<Master />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
