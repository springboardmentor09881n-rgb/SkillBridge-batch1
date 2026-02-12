import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import './Auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('volunteer');
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        password: '',
        location: '',
        skills: '',
        organization_name: '',
        organization_description: '',
        website_url: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registering as:', role, formData);
        alert(`Registration simulated for ${role}: ${formData.username || formData.email}`);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Create an Account</h1>
                    <p className="auth-subtitle">Join SkillBridge to connect with NGOs and volunteering opportunities</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                        id="full_name"
                        label="Full Name"
                        placeholder="Enter your full name or organization contact name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    <Select
                        id="role"
                        label="I am a"
                        value={role}
                        onChange={handleRoleChange}
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

                    {role === 'volunteer' && (
                        <Input
                            id="skills"
                            label="Skills (Optional)"
                            placeholder="e.g. web development, teaching, design (comma separated)"
                            value={formData.skills}
                            onChange={handleChange}
                        />
                    )}

                    {role === 'ngo' && (
                        <>
                            <Input
                                id="organization_name"
                                label="Organization Name"
                                placeholder="Enter your organization's name"
                                value={formData.organization_name}
                                onChange={handleChange}
                                required
                            />
                            <Textarea
                                id="organization_description"
                                label="Organization Description"
                                placeholder="Tell us about your organization's mission and goals"
                                value={formData.organization_description}
                                onChange={handleChange}
                            />
                            <Input
                                id="website_url"
                                label="Website URL (Optional)"
                                placeholder="https://yourorganization.org"
                                value={formData.website_url}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <Button type="submit" size="lg" className="w-full mt-4" style={{ width: '100%', backgroundColor: '#6366f1' }}>
                        Create Account
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
