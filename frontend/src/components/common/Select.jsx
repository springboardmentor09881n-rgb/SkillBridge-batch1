import React from 'react';
import './Input.css'; // Reusing input styles

const Select = ({
    label,
    error,
    id,
    options = [],
    className = '',
    wrapperClassName = '',
    ...props
}) => {
    return (
        <div className={`input-group ${wrapperClassName}`}>
            {label && <label htmlFor={id} className="input-label">{label}</label>}
            <select
                id={id}
                className={`input-field select-field ${error ? 'input-error' : ''} ${className}`}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="input-error-msg">{error}</span>}
        </div>
    );
};

export default Select;
