import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layouts/application/AppLayout';
import RouterProgressHandler from '@/components/providers/RouteProvider';
import AppHome from '@/components/contents/application/_home/AppHome';

function App() {
  return (
    <Router>
      <RouterProgressHandler />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AppHome />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;