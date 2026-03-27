import React, { useState } from "react";
import { ChevronRight, Plus, X } from "lucide-react";

const OpportunitiesForm = ({ onSubmit, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        title: "",
        description: "",
        skills: "",
        duration: "",
        location: "",
        status: "Open",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm max-w-4xl mx-auto overflow-hidden">
            <div className="p-10">
                {/* Back Link */}
                <button
                    onClick={onCancel}
                    className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors mb-8"
                >
                    <span className="text-lg">‹</span> Back
                </button>

                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mb-10">
                    {initialData ? "Edit Opportunity" : "Create New Opportunity"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Title
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Website Redesign"
                            required
                            className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:border-[var(--color-primary)] outline-none text-[13px] font-medium text-[var(--text-primary)] transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Description
                        </label>
                        <textarea
                            rows="6"
                            placeholder="Provide details about the opportunity"
                            required
                            className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:border-[var(--color-primary)] outline-none text-[13px] font-medium text-[var(--text-primary)] transition-all resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Required Skills
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="e.g. Web Development"
                                className="flex-1 px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:border-[var(--color-primary)] outline-none text-[13px] font-medium text-[var(--text-primary)] transition-all"
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            />
                            <button type="button" className="px-8 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                Duration
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 2-3 weeks, Ongoing"
                                required
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:border-[var(--color-primary)] outline-none text-[13px] font-medium text-[var(--text-primary)] transition-all"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                Location
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. New York, NY, Remote"
                                required
                                className="w-full px-6 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl focus:border-[var(--color-primary)] outline-none text-[13px] font-medium text-[var(--text-primary)] transition-all"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                className="premium-dropdown !bg-[var(--bg-main)] !text-[var(--text-primary)] !border-[var(--border-color)]"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-10">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-10 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10"
                        >
                            {initialData ? "Save" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OpportunitiesForm;
