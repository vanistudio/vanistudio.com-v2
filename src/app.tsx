import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layouts/application/AppLayout';
import RouterProgressHandler from '@/components/providers/RouteProvider';
function App() {
  return (
    <>
    <Router>
      <RouterProgressHandler />
      <Routes>
        <Route path="/" element={<Layout />} />
      </Routes>
    </Router>
    </>
  );
}
export default App;