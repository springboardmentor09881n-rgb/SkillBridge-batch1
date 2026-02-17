import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NgoDashboard from './pages/Dashboard/NgoDashboard';
import VolunteerDashboard from './pages/Dashboard/VolunteerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ngodashboard" element={<NgoDashboard />} />
          <Route path="/volunteerdashboard" element={<VolunteerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
