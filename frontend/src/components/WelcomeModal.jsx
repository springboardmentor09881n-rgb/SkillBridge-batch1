import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Smile, Heart, Award, Star } from 'lucide-react';
import './WelcomeModal.css';

const QUOTES = [
    { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
    { text: "No act of kindness, no matter how small, is ever wasted.", author: "Aesop" },
    { text: "Volunteers don't get paid, not because they're worthless, but because they're priceless.", author: "Sherry Anderson" },
    { text: "Great things are done by a series of small things brought together.", author: "Vincent Van Gogh" },
    { text: "Our contribution can change a life today!", author: "SkillBridge Team" }
];

const WelcomeModal = ({ isOpen, onClose, userName }) => {
    const [quote, setQuote] = useState(QUOTES[0]);

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        setQuote(QUOTES[randomIndex]);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="welcome-modal-overlay">
                <motion.div 
                    className="welcome-modal-content"
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                    {/* Poppers / Confetti Effect */}
                    <div className="poppers-container">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="popper-sparkle"
                                initial={{ scale: 0, x: 0, y: 0 }}
                                animate={{ 
                                    scale: [0, 1, 0], 
                                    x: (Math.random() - 0.5) * 400, 
                                    y: (Math.random() - 0.5) * 400,
                                    rotate: Math.random() * 360
                                }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: Math.random() * 2,
                                    ease: "easeOut"
                                }}
                            >
                                {i % 4 === 0 ? <Sparkles size={20} color="#fbbf24" /> : 
                                 i % 4 === 1 ? <Heart size={18} color="#f43f5e" /> : 
                                 i % 4 === 2 ? <Star size={20} color="#3b82f6" /> : 
                                 <Smile size={18} color="#10b981" />}
                            </motion.div>
                        ))}
                    </div>

                    <div className="welcome-header">
                        <div className="welcome-icon-box">
                            <Sparkles className="sparkle-icon" size={32} />
                        </div>
                        <h2>Welcome to SkillBridge, {userName}!</h2>
                        <p className="welcome-subtitle">We're so glad you're here to make a difference.</p>
                    </div>

                    <div className="quote-section">
                        <motion.div 
                            className="quote-card"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="quote-text">"{quote.text}"</p>
                            <span className="quote-author">— {quote.author}</span>
                        </motion.div>
                    </div>

                    <div className="welcome-footer">
                        <button className="get-started-btn" onClick={onClose}>
                            Let's Get Started
                        </button>
                    </div>

                    <button className="close-welcome-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WelcomeModal;
