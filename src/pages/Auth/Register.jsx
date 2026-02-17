import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { registerUser } from '../../services/api';
import { ArrowLeft } from 'lucide-react';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if role was passed in navigation state, default to 'volunteer'
    const initialIam = location.state?.iam || 'volunteer';
    const [iam, setIam] = useState(initialIam);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        skills: '',
        organizationName: '',
        organizationDescription: '',
        websiteUrl: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        if (error) setError('');
    };

    const handleIamChange = (e) => {
        setIam(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');

        // Format payload based on role
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            role: iam,
            location: formData.location
        };

        if (iam === 'volunteer') {
            payload.skills = formData.skills;
        } else {
            payload.organizationName = formData.organizationName;
            payload.organizationDescription = formData.organizationDescription;
            payload.websiteUrl = formData.websiteUrl;
        }

        const result = await registerUser(payload);

        setIsLoading(false);

        if (result.success) {
            alert('Registration successful!');
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            navigate(iam === 'volunteer' ? '/volunteer-dashboard' : '/ngo-dashboard');
        } else {
            if (result.errors) {
                const firstError = Object.values(result.errors)[0];
                setError(firstError);
            } else {
                setError(result.message);
            }
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
                    <h1 className="auth-title">Create an Account</h1>
                    <p className="auth-subtitle">Join SkillBridge to connect with NGOs and volunteering opportunities</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error-message">{error}</div>}
                    <Input
                        id="username"
                        label="Username"
                        placeholder="Choose a unique username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        id="fullName"
                        label="Full Name"
                        placeholder="Enter your full name or organization contact name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        id="iam"
                        label="I am a"
                        value={iam}
                        onChange={handleIamChange}
                        options={[
                            { value: 'volunteer', label: 'Volunteer' },
                            { value: 'ngo', label: 'NGO / Organization' }
                        ]}
                    />

                    <Input
                        id="location"
                        label="Location (Optional)"
                        placeholder="e.g. New York, NY"
                        value={formData.location}
                        onChange={handleChange}
                    />

                    {iam === 'volunteer' && (
                        <Input
                            id="skills"
                            label="Skills (Optional)"
                            placeholder="e.g. web development, teaching, design (comma separated)"
                            value={formData.skills}
                            onChange={handleChange}
                        />
                    )}

                    {iam === 'ngo' && (
                        <>
                            <Input
                                id="organizationName"
                                label="Organization Name"
                                placeholder="Enter your organization's name"
                                value={formData.organizationName}
                                onChange={handleChange}
                                required
                            />
                            <Textarea
                                id="organizationDescription"
                                label="Organization Description"
                                placeholder="Tell us about your organization's mission and goals"
                                value={formData.organizationDescription}
                                onChange={handleChange}
                            />
                            <Input
                                id="websiteUrl"
                                label="Website URL (Optional)"
                                placeholder="https://yourorganization.org"
                                value={formData.websiteUrl}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4"
                        style={{ width: '100%', backgroundColor: '#6366f1' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <div className="auth-footer">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
