import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import NgoDashboard from './pages/Dashboard/NgoDashboard';
import VolunteerDashboard from './pages/Dashboard/VolunteerDashboard';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ngodashboard" element={<NgoDashboard />} />
          <Route path="/ngo/:tab" element={<NgoDashboard />} />
          <Route path="/ngo/:tab/:action" element={<NgoDashboard />} />
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/:tab" element={<VolunteerDashboard />} />
          <Route path="/volunteer/:tab/:action" element={<VolunteerDashboard />} />
          <Route path="/volunteerdashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/profile" element={<Profile />} />
          <Route path="/ngo/profile" element={<Profile />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
