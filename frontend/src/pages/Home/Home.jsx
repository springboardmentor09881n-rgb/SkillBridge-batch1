import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, User, Building2, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();

    const heroImages = [
        "/assets/1.png",
        "/assets/2.png",
        "/assets/3.png",
        "/assets/4.png",
        "/assets/5.png",
        "/assets/6.png",
        "/assets/7.png",
        "/assets/8.png",
        "/assets/9.png",
        "/assets/10.png",
        "/assets/11.png",
        "/assets/12.png"
    ];

    const doubleImages = [...heroImages, ...heroImages]; // For seamless infinite loop

    const scrollToPathway = () => {
        document.getElementById('pathway')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="home-container">
            {/* Animated Background Blobs */}
            <div className="bg-blobs">
                <motion.div
                    className="blob blob-1"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="blob blob-2"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Header / Navbar */}
            <header className="home-header">
                <div className="header-content container">
                    <motion.div
                        className="logo"
                        onClick={() => navigate('/')}
                        whileHover={{ scale: 1.05 }}
                    >
                        SkillBridge
                    </motion.div>
                    <nav className="nav-links">
                        {/* Links removed as per user request */}
                    </nav>
                    <div className="header-actions">
                        <button className="theme-toggle" onClick={toggleTheme}>
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/login" className="login-link">Sign In</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container hero-container-centered">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="hero-badge"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, type: "spring" }}
                        >
                            <span className="dot"></span>
                            IMPACT NETWORK
                        </motion.div>
                        <h1 className="hero-title">
                            Connecting Expertise <br />
                            to <span className="highlight">Global Purpose.</span>
                        </h1>
                        <p className="hero-subtitle">
                            SkillBridge bridges the gap between talented professionals and mission-driven organizations.
                            A professional ecosystem designed for collaborative social impact.
                        </p>
                        <div className="hero-cta">
                            <Button size="lg" icon={ArrowRight} onClick={scrollToPathway}>Get Started Now</Button>
                        </div>
                    </motion.div>

                    <div className="hero-scroll-container">
                        <div className="hero-image-grid-infinite">
                            <motion.div
                                className="image-track track-left"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            >
                                {doubleImages.map((img, idx) => (
                                    <div key={idx} className="hero-card">
                                        <img src={img} alt="Impact" />
                                    </div>
                                ))}
                            </motion.div>
                            <motion.div
                                className="image-track track-right"
                                animate={{ x: ["-50%", "0%"] }}
                                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                            >
                                {doubleImages.map((img, idx) => (
                                    <div key={idx} className="hero-card">
                                        <img src={img} alt="Impact" />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Optimized Pathway Section */}
            <section id="pathway" className="cta-section">
                <div className="container">
                    <motion.div
                        className="cta-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="cta-title">Choose Your Pathway</h2>
                        <p className="cta-subtitle">Begin your journey towards meaningful collaboration.</p>
                    </motion.div>

                    <div className="path-grid">
                        <motion.div
                            className="path-card"
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="card-header">
                                <User size={32} />
                                <h3>Become a Volunteer</h3>
                            </div>
                            <p>Apply your professional skills to solve real-world challenges.</p>
                            <ul className="card-features">
                                <li><CheckCircle2 size={16} /> Technical & Creative Skill Matching</li>
                                <li><CheckCircle2 size={16} /> Advanced Filtering System</li>
                                <li><CheckCircle2 size={16} /> Professional Portfolio Tracking</li>
                                <li><CheckCircle2 size={16} /> Personal Impact ROI Dashboard</li>
                            </ul>
                            <Button className="w-full" onClick={() => navigate('/register', { state: { iam: 'volunteer' } })}>
                                Join as Volunteer
                            </Button>
                        </motion.div>

                        <motion.div
                            className="path-card"
                            whileHover={{ y: -10 }}
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="card-header">
                                <Building2 size={32} />
                                <h3>Register as NGO</h3>
                            </div>
                            <p>Enlist high-quality talent to expand your mission’s scale.</p>
                            <ul className="card-features">
                                <li><CheckCircle2 size={16} /> Opportunity Lifecycle Management</li>
                                <li><CheckCircle2 size={16} /> Structured Candidate Review</li>
                                <li><CheckCircle2 size={16} /> Integrated Messaging System</li>
                                <li><CheckCircle2 size={16} /> Engagement & Outcome Analytics</li>
                            </ul>
                            <Button className="w-full" onClick={() => navigate('/register', { state: { iam: 'ngo/organization' } })}>
                                Register Organization
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="main-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">SkillBridge</div>
                        <p>© 2026 SkillBridge. Passionately bridging the gap.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
