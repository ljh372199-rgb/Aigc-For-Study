import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout';
import { Dashboard } from '@/pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/monitoring" element={<div className="text-text-primary">Monitoring Page</div>} />
            <Route path="/resources" element={<div className="text-text-primary">Resources Page</div>} />
            <Route path="/users" element={<div className="text-text-primary">Users Page</div>} />
            <Route path="/settings" element={<div className="text-text-primary">Settings Page</div>} />
          </Routes>
        </MainLayout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
