import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Registration from "@/pages/Registration";
import EmergencyAlert from "@/pages/EmergencyAlert";
import PersonalizedGuide from "@/pages/PersonalizedGuide";
import ShelterMap from "@/pages/ShelterMap";
import SOSButton from "@/components/SOSButton";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/registration" component={Registration} />
      <Route path="/emergency" component={EmergencyAlert} />
      <Route path="/guide" component={PersonalizedGuide} />
      <Route path="/shelters" component={ShelterMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b-2 border-emergency">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emergency text-white rounded-full flex items-center justify-center">
                      <i className="fas fa-compass text-lg" aria-hidden="true"></i>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-emergency">안전나침반</h1>
                      <p className="text-sm text-gray-600">Safe Compass</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full">
                        <span className="sr-only">사용자 프로필</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Router />
            </main>

            {/* SOS Floating Button */}
            <SOSButton />
            
            <Toaster />
          </div>
        </TooltipProvider>
      </AccessibilityProvider>
    </QueryClientProvider>
  );
}

export default App;
