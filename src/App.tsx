import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import Dashboard from "./pages/Dashboard";
import NewTicket from "./pages/NewTicket";
import TicketsList from "./pages/TicketsList";
import TicketDetail from "./pages/TicketDetail";
import LeadsPage from "./pages/LeadsPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import RequireRole from "./components/RequireRole";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminClients from "./pages/admin/AdminClients";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LeadsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/tickets" element={<TicketsList />} />
              <Route path="/tickets/new" element={<NewTicket />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              {/* Admin routes */}
              <Route path="/admin" element={<RequireRole roles={['admin', 'support']}><AdminLayout><AdminOverview /></AdminLayout></RequireRole>} />
              <Route path="/admin/tickets" element={<RequireRole roles={['admin', 'support']}><AdminLayout><AdminTickets /></AdminLayout></RequireRole>} />
              <Route path="/admin/clients" element={<RequireRole roles={['admin', 'support']}><AdminLayout><AdminClients /></AdminLayout></RequireRole>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
