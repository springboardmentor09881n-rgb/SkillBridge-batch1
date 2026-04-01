import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';

const colorMap = {
    blue: {
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1d4ed8',
        iconBg: '#3b82f6',
        darkBg: 'rgba(59,130,246,0.12)',
        darkBorder: 'rgba(147,197,253,0.2)',
        darkText: '#93c5fd',
    },
    green: {
        bg: '#f0fdf4',
        border: '#bbf7d0',
        text: '#15803d',
        iconBg: '#22c55e',
        darkBg: 'rgba(34,197,94,0.12)',
        darkBorder: 'rgba(134,239,172,0.2)',
        darkText: '#86efac',
    },
    amber: {
        bg: '#fffbeb',
        border: '#fde68a',
        text: '#b45309',
        iconBg: '#f59e0b',
        darkBg: 'rgba(245,158,11,0.12)',
        darkBorder: 'rgba(253,224,71,0.2)',
        darkText: '#fcd34d',
    },
    indigo: {
        bg: '#eef2ff',
        border: '#c7d2fe',
        text: '#4338ca',
        iconBg: '#6366f1',
        darkBg: 'rgba(99,102,241,0.12)',
        darkBorder: 'rgba(165,180,252,0.2)',
        darkText: '#a5b4fc',
    },
};

const StatCard = ({ title, value, icon: Icon, variant = 'blue' }) => {
    const { isDarkMode } = useTheme();
    const c = colorMap[variant] || colorMap.blue;

    const bg = isDarkMode ? (c.darkBg || c.bg) : c.bg;
    const border = isDarkMode ? (c.darkBorder || c.border) : c.border;

    const textColor = isDarkMode ? (c.darkText || c.text) : c.text;
    const titleColor = isDarkMode ? '#cbd5e1' : '#64748b'; // matches text-secondary in variables.css

    return (
        <motion.div
            className="stat-card-new"
            style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '0.875rem',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
            }}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Icon badge */}
            <div style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                background: c.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: `0 4px 12px ${c.iconBg}55`,
                flexShrink: 0,
            }}>
                {Icon && <Icon size={18} />}
            </div>

            {/* Number + label */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: textColor,
                }}>
                    {value ?? '—'}
                </span>
                <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: titleColor,
                }}>
                    {title}
                </span>
            </div>
        </motion.div>
    );
};

export default StatCard;
