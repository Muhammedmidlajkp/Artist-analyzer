import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import EmployeePanel from './pages/EmployeePanel';
import DataTable from './pages/DataTable';
import AdminDashboard from './pages/AdminDashboard';
import ReferralTracking from './pages/ReferralTracking';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<EmployeePanel />} />
          <Route path="table" element={<DataTable />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="referrals" element={<ReferralTracking />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
