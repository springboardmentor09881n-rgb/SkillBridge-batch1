import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [role, setRole] = useState('volunteer'); // For mock login, user chooses role to sim

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate login
        console.log('Logging in as:', role, formData);
        alert(`Login simulated for ${role}: ${formData.identifier}`);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue your journey</p>
                </div>

                {/* Role Selector */}
                <div className="role-toggle">
                    <button
                        type="button"
                        className={`role-toggle-btn ${role === 'volunteer' ? 'active' : ''}`}
                        onClick={() => setRole('volunteer')}
                    >
                        Volunteer
                    </button>
                    <button
                        type="button"
                        className={`role-toggle-btn ${role === 'ngo' ? 'active' : ''}`}
                        onClick={() => setRole('ngo')}
                    >
                        NGO
                    </button>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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

                    <Button type="submit" size="lg" className="w-full" style={{ width: '100%' }}>
                        Sign In
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
