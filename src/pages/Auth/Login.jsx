import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginUser } from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [iam, setIam] = useState('Volunteer'); // For mock login, user chooses role to sim
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        setError('');

        const result = await loginUser({
            identifier: formData.identifier,
            password: formData.password,
            role: iam
        });

        setIsLoading(false);

        if (result.success) {
            login(result.data.user);
            alert('Login successful!');
            // Token is already stored in api.js:loginUser
            // Navigate based on actual role from backend
            const role = result.data.user.role;
            navigate(role === 'Volunteer' ? '/volunteerdashboard' : '/ngodashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <button
                        className="back-button"
                        onClick={() => navigate('/')}
                        title="Back to Home"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue your journey</p>
                </div>

                {/* Role Selector */}
                <div className="role-toggle">
                    <button
                        type="button"
                        className={`role-toggle-btn ${iam === 'Volunteer' ? 'active' : ''}`}
                        onClick={() => setIam('Volunteer')}
                    >
                        Volunteer
                    </button>
                    <button
                        type="button"
                        className={`role-toggle-btn ${iam === 'NGO/Organisation' ? 'active' : ''}`}
                        onClick={() => setIam('NGO/Organisation')}
                    >
                        NGO
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error-message">{error}</div>}
                    <Input
                        id="identifier"
                        label="Username or Email"
                        type="text"
                        placeholder="Enter your username or email"
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
