import React from 'react';
import './Input.css'; // Reusing input styles

const Textarea = ({
    label,
    error,
    id,
    className = '',
    rows = 4,
    ...props
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <textarea
                id={id}
                rows={rows}
                className={`input-field ${error ? 'input-error' : ''}`}
                {...props}
            />
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Textarea;
