import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import { loginUser } from '../../services/api'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            // Call login API with only email and password
            const result = await loginUser(formData.email, formData.password)

            setIsLoading(false)

            if (result.success) {
                // Save user in context
                login(result.data.user)

                // Token is already stored in api.js:loginUser
                alert('Login successful!')

                // Navigate based on role from backend
                const role = result.data.user.role
                navigate(role === 'volunteer' ? '/volunteer/dashboard' : '/ngo/dashboard')
            } else {
                setError(result.message)
            }
        } catch (err) {
            setIsLoading(false)
            setError('Login failed. Please try again.')
        }
    }

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

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="auth-error-message">{error}</div>}

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
    )
}

export default Login
