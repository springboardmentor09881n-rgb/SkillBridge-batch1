import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ArrowRight, Search, MessageSquare,
    Rocket, BarChart3, Heart, UserPlus, Briefcase,
    User, Building2, CheckCircle2
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const scrollToPathway = () => {
        document.getElementById('pathway')?.scrollIntoView({ behavior: 'smooth' });
    };

    const timelineSteps = [
        {
            id: '01',
            icon: UserPlus,
            title: 'Create Your Account',
            description: 'Choose your role and build your professional profile.',
            details: 'Volunteers showcase their technical and creative skills. Organizations define their mission and operational requirements.',
            footer: 'Your impact journey starts here.',
            color: 'blue'
        },
        {
            id: '02',
            icon: Search,
            title: 'Discover or Post Opportunities',
            description: 'Focus on purpose-driven matching.',
            details: 'NGOs publish structured projects. Volunteers use advanced filters to find opportunities aligned with their expertise and values.',
            footer: 'Precision-matched opportunities.',
            color: 'green'
        },
        {
            id: '03',
            icon: Briefcase,
            title: 'Apply & Evaluate',
            description: 'Streamlined application workflow.',
            details: 'Volunteers submit structured applications. Organizations manage candidates through an intuitive Pending • Accepted • Rejected pipeline.',
            footer: 'Transparent. Organized. Efficient.',
            color: 'purple'
        },
        {
            id: '04',
            icon: MessageSquare,
            title: 'Collaborate in Real-Time',
            description: 'Integrated communication tools.',
            details: 'Clarify expectations and coordinate efforts directly through our built-in messaging system.',
            footer: 'All communications, centralized.',
            color: 'orange'
        },
        {
            id: '05',
            icon: Heart,
            title: 'Deliver Social Impact',
            description: 'Execute projects and track progress.',
            details: 'Work together on meaningful initiatives while monitoring engagement through your personal dashboard.',
            footer: 'Turning expertise into action.',
            color: 'red'
        },
        {
            id: '06',
            icon: BarChart3,
            title: 'Measure Outcomes',
            description: 'Data-driven impact assessment.',
            details: 'Volunteers track their contribution history. Organizations monitor volunteer engagement and social ROI.',
            footer: 'Impact, quantified and celebrated.',
            color: 'yellow'
        }
    ];

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

            {/* Value Proposition Section */}
            <section className="problem-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">The Professional Way to Give Back</h2>
                        <p className="section-subtitle">
                            We provide a structured platform for non-profits to access world-class talent and for professionals to find high-impact opportunities that match their skills.
                        </p>
                    </motion.div>

                    <motion.div
                        className="solution-features"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        {[
                            {
                                icon: Search,
                                title: "Skill Discovery",
                                text: "Precision-matched opportunities based on your technical expertise."
                            },
                            {
                                icon: BarChart3,
                                title: "Impact Analytics",
                                text: "Quantify your social ROI with detailed engagement metrics."
                            },
                            {
                                icon: MessageSquare,
                                title: "Direct Connect",
                                text: "Seamless communication with organization stakeholders in real-time."
                            },
                            {
                                icon: Rocket,
                                title: "Impact Cycles",
                                text: "Structured workflows designed for agile project delivery."
                            }
                        ].map((item, i) => (
                            <motion.div key={i} className="feature-card" variants={itemVariants} whileHover={{ y: -5 }}>
                                <div className="feature-icon-wrapper">
                                    <item.icon className="feature-icon" />
                                </div>
                                <div className="feature-card-content">
                                    <h3 className="feature-title">{item.title}</h3>
                                    <p className="feature-text">{item.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="timeline-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">A Seamless Impact Workflow</h2>
                        <p className="section-subtitle">Designed for clarity and efficiency</p>
                    </motion.div>

                    <div className="timeline-container">
                        <div className="timeline-line" />
                        {timelineSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <motion.div
                                    className={`timeline-dot dot-${step.color}`}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                    initial={{ scale: 0.8 }}
                                    whileInView={{ scale: 1 }}
                                >
                                    <step.icon size={22} className="timeline-icon" />
                                </motion.div>
                                <motion.div
                                    className="timeline-content"
                                    whileHover={{ y: -5, boxShadow: "var(--shadow-xl)" }}
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                >
                                    <motion.h3 className={`step-title text-${step.color}`} variants={itemVariants}>{step.title}</motion.h3>
                                    <motion.p className="step-desc" variants={itemVariants}>{step.description}</motion.p>
                                    <motion.p className="step-details" variants={itemVariants}>{step.details}</motion.p>
                                    <motion.div className="step-footer" variants={itemVariants}>{step.footer}</motion.div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Analytics & Impact Preview */}
            <section className="impact-section">
                <div className="container">
                    <motion.div
                        className="section-header"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title">Measurable Collaboration</h2>
                        <p className="section-subtitle">Real-time tracking for every project and contribution.</p>
                    </motion.div>
                    <div className="impact-grid">
                        <motion.div
                            className="impact-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3>For Volunteers</h3>
                            <ul>
                                <li>Application outcomes tracking</li>
                                <li>Skill contribution history</li>
                                <li>Direct NGO engagement metrics</li>
                            </ul>
                        </motion.div>
                        <motion.div
                            className="impact-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3>For Organizations</h3>
                            <ul>
                                <li>Talent acquisition dashboard</li>
                                <li>Active opportunity management</li>
                                <li>Project engagement analytics</li>
                            </ul>
                        </motion.div>
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
                            <Button className="w-full" onClick={() => navigate('/register', { state: { iam: 'ngo' } })}>
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
