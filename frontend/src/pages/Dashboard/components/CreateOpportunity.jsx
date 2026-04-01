import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createOpportunity } from '../../../services/api';

const CreateOpportunity = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        location: '',
        status: 'open',
        requiredSkills: []
    });
    const [skillInput, setSkillInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            setFormData(prev => ({
                ...prev,
                requiredSkills: prev.requiredSkills.includes(skillInput.trim()) 
                    ? prev.requiredSkills 
                    : [...prev.requiredSkills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const handleCreate = async () => {
        if (!formData.title || !formData.description) {
            alert('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        const result = await createOpportunity(formData);
        if (result.success) {
            alert('Opportunity created successfully!');
            navigate('/ngo/opportunities');
        } else {
            alert(result.message || 'Error creating opportunity');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="create-opp-container">
            <div className="create-opp-header">
                <button
                    onClick={() => navigate('/ngo/opportunities')}
                    className="create-opp-back-btn"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <h2>Create New Opportunity</h2>
            </div>

            <div className="create-opp-card">
                <div className="create-opp-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Website Redesign"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            placeholder="Provide details about the opportunity"
                            rows={4}
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label>Required Skills</label>
                        <div className="skills-input-group">
                            <input
                                type="text"
                                placeholder="e.g. Web Development"
                                className="form-input"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                            />
                            <button className="btn-secondary" onClick={handleAddSkill}>Add</button>
                        </div>
                        <div className="flex gap-2 mt-2">
                            {formData.requiredSkills.map((skill, i) => (
                                <span key={i} className="ngo-opp-tag">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half-width">
                            <label>Duration</label>
                            <input
                                type="text"
                                placeholder="e.g. 2-3 weeks, Ongoing"
                                className="form-input"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                        <div className="form-group half-width">
                            <label>Location</label>
                            <input
                                type="text"
                                placeholder="e.g. New York, NY, Remote"
                                className="form-input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Status</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="create-opp-actions">
                        <button
                            onClick={() => navigate('/ngo/opportunities')}
                            className="btn-outline"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleCreate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateOpportunity;
