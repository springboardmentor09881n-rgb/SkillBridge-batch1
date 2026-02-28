import React, { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageSquare,
  Plus,
  MapPin,
  Clock,
  ChevronRight,
  User,
  LogOut,
  Bell,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

// --- Mock Data ---
const INITIAL_OPPORTUNITIES = [
  {
    id: 1,
    ngoId: 2,
    title: "Website Redesign for Local Shelter",
    description:
      "Help us redesign our website to improve our online presence and reach more potential adopters.",
    skills: ["Web Development", "UI/UX Design"],
    location: "New York, NY",
    duration: "2-3 weeks",
    status: "Open",
  },
  {
    id: 2,
    ngoId: 2,
    title: "Translation of Educational Materials",
    description:
      "Translate educational materials from English to Spanish, French, or Arabic to support our global literacy programs.",
    skills: ["Translation", "Language Skills"],
    location: "Remote",
    duration: "Ongoing",
    status: "Open",
  },
  {
    id: 3,
    ngoId: 2,
    title: "Fundraising Gala Event Coordinator",
    description:
      "Help plan and coordinate our annual fundraising gala to support children's medical research.",
    skills: ["Event Planning", "Marketing"],
    location: "Chicago, IL",
    duration: "3 months",
    status: "Open",
  },
];

const INITIAL_APPLICATIONS = [
  {
    id: 101,
    volunteerName: "John Doe",
    opportunityTitle: "Website Redesign for Local Shelter",
    date: "May 8, 2025",
    status: "pending",
    message:
      "I have 5 years of experience in web development and design. I've worked with several nonprofits before and would love to help improve your online presence.",
    skills: ["Web Development", "Design"],
  },
];

// --- Components ---

const Navbar = ({ role, activeTab, setActiveTab }) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "opportunities", label: "Opportunities" },
    { id: "applications", label: "Applications" },
    { id: "messages", label: "Messages" },
  ];

  return (
    <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          SkillBridge
        </h1>
        <div className="hidden md:flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[13px] font-semibold transition-colors relative h-16 px-1 flex items-center ${
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <span
            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
              role === "NGO" ? "text-green-600" : "text-blue-600"
            }`}
          >
            {role === "NGO" ? "Ngo" : "Volunteer"}
          </span>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
              <User size={14} className="text-gray-400" />
            </div>
            <ChevronDown size={12} className="text-gray-400" />
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </nav>
  );
};

const App = () => {
  const [userRole, setUserRole] = useState("NGO");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills: "",
    duration: "",
    location: "",
    status: "Open",
  });

  const handleCreateOpportunity = (e) => {
    e.preventDefault();
    const newOp = {
      ...formData,
      id: Date.now(),
      ngoId: 2,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };
    setOpportunities([newOp, ...opportunities]);
    setShowCreateForm(false);
    setFormData({
      title: "",
      description: "",
      skills: "",
      duration: "",
      location: "",
      status: "Open",
    });
  };

  const renderNGODashboard = () => (
    <div className="space-y-8">
      {/* Overview Header - Matches exact PDF styling */}
      <div>
        <h2 className="text-4xl font-bold text-gray-800 tracking-tight">
          Overview
        </h2>
        <p className="text-lg text-gray-400 mt-1 font-medium">
          HopeForAll Foundation
        </p>
      </div>

      {/* Stats Grid - Exact match to your selection and PDF p.11 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "ACTIVE OPPORTUNITIES", value: opportunities.length },
          { label: "APPLICATIONS", value: "1" },
          { label: "ACTIVE VOLUNTEERS", value: "0" },
          { label: "PENDING APPLICATIONS", value: "1" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#f1f1f1] px-8 py-10 rounded-lg border border-gray-200"
          >
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">
              {stat.label}
            </p>
            <p className="text-5xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xl font-bold text-gray-800">
              Recent Applications
            </h3>
            <button
              onClick={() => setActiveTab("applications")}
              className="text-blue-600 text-sm font-bold hover:underline"
            >
              View All
            </button>
          </div>

          {/* Application Card */}
          {INITIAL_APPLICATIONS.map((app) => (
            <div
              key={app.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-base border border-blue-100">
                    JD
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {app.volunteerName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Applied for{" "}
                      <span className="text-blue-600 font-semibold">
                        {app.opportunityTitle}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-bold rounded border border-yellow-100 uppercase tracking-wider">
                  {app.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed bg-[#f9f9f9] p-4 rounded-lg">
                {app.message}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {app.skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wide border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex gap-4">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-sm transition-all">
                  Accept
                </button>
                <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setActiveTab("opportunities");
                  setShowCreateForm(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-sm"
              >
                <Plus size={18} /> Create New Opportunity
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all"
              >
                <MessageSquare size={18} /> View Messages
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 uppercase">
              ORGANIZATION INFO
            </h3>
            <div className="space-y-4">
              <p className="font-bold text-gray-800 text-lg">
                HopeForAll Foundation
              </p>
              <p className="text-sm text-gray-500 leading-relaxed italic">
                Dedicated to community empowerment and sustainable development
                through collaborative efforts.
              </p>
              <div className="pt-2">
                <a
                  href="#"
                  className="text-sm text-blue-600 font-semibold flex items-center gap-2 hover:underline truncate"
                >
                  <ExternalLink size={14} />
                  https://www.hopeforall.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVolunteerDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Find Opportunities
          </h3>
          <p className="text-base text-gray-500 mb-8">
            Discover volunteering opportunities that match your skills and
            interests.
          </p>
          <button
            onClick={() => setActiveTab("opportunities")}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-base hover:bg-blue-700 transition-all shadow-md"
          >
            Browse All Opportunities
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 px-1">
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {opportunities.slice(0, 2).map((op) => (
              <div
                key={op.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {op.title}
                  </h4>
                  <span className="px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    Open
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                  NGO ID: {op.ngoId}
                </p>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                  {op.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {op.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase border border-blue-100 tracking-wide"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <button className="text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:gap-1.5 transition-all uppercase tracking-widest">
                  View details <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl border border-gray-200 shadow-sm">
              <User size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Test Volunteer
              </h3>
              <p className="text-sm text-gray-500 font-medium">Volunteer</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                YOUR SKILLS
              </p>
              <button className="text-[11px] text-blue-600 font-bold uppercase hover:underline tracking-wide">
                Add Skills
              </button>
            </div>
            <p className="text-sm text-gray-400 italic py-2">
              No skills added yet
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              ACTIVITY
            </p>
            <p className="text-sm text-gray-400 italic py-2">
              No recent activity
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">
            Your Impact
          </h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
              <p className="text-3xl font-bold text-gray-800">0</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">
                Applied
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
              <p className="text-3xl font-bold text-gray-800">0</p>
              <p className="text-[11px] font-bold text-gray-400 uppercase mt-1">
                Accepted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpportunities = () => {
    if (showCreateForm && userRole === "NGO") {
      return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg max-w-2xl mx-auto overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-800"
              >
                <ChevronRight className="rotate-180" size={24} />
              </button>
              <h3 className="text-xl font-bold text-gray-800">
                Create New Opportunity
              </h3>
            </div>
          </div>
          <form onSubmit={handleCreateOpportunity} className="p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Title
              </label>
              <input
                type="text"
                placeholder="eg. Website Redesign"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Description
              </label>
              <textarea
                rows="4"
                placeholder="Provide details about the opportunity"
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Required Skills
                </label>
                <input
                  type="text"
                  placeholder="e.g. Web Development"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  value={formData.skills}
                  onChange={(e) =>
                    setFormData({ ...formData, skills: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 weeks"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY, Remote"
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:border-blue-500 outline-none text-sm font-bold appearance-none transition-all"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-gray-50">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-md"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Your Opportunities
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor your volunteering posts
            </p>
          </div>
          {userRole === "NGO" && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-xs hover:bg-blue-700 shadow-sm flex items-center gap-2 tracking-wide transition-all"
            >
              <Plus size={18} /> Create New Opportunity
            </button>
          )}
        </div>

        <div className="flex gap-10 border-b border-gray-100">
          <button className="pb-4 border-b-2 border-blue-600 text-blue-600 text-xs font-bold uppercase tracking-widest">
            All ({opportunities.length})
          </button>
          <button className="pb-4 text-gray-400 hover:text-gray-800 text-xs font-bold uppercase tracking-widest">
            Open ({opportunities.filter((o) => o.status === "Open").length})
          </button>
          <button className="pb-4 text-gray-400 hover:text-gray-800 text-xs font-bold uppercase tracking-widest">
            Closed (0)
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {opportunities.map((op) => (
            <div
              key={op.id}
              className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-1">
                    <h4 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors tracking-tight">
                      {op.title}
                    </h4>
                    <span className="px-3 py-1 bg-green-500 text-white text-[9px] font-bold rounded uppercase tracking-wider">
                      {op.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                    NGO ID: {op.ngoId}
                  </p>
                  <p className="text-gray-500 text-base mb-6 leading-relaxed max-w-4xl">
                    {op.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {op.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase border border-blue-100 tracking-wide"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-8 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <MapPin size={16} /> {op.location}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock size={16} /> {op.duration}
                    </span>
                  </div>
                </div>
                <button className="w-full md:w-28 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-bold text-xs hover:bg-gray-50 transition-all uppercase tracking-widest">
                  Edit
                </button>
              </div>
              <button className="mt-8 text-blue-600 font-bold text-xs flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-widest">
                View details <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return userRole === "NGO"
          ? renderNGODashboard()
          : renderVolunteerDashboard();
      case "opportunities":
        return renderOpportunities();
      default:
        return (
          <div className="bg-white p-20 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-widest">
              Module Coming Soon
            </h3>
            <p className="text-gray-400 text-sm mt-3 font-medium">
              Planned for Milestone 3 & 4 development cycles.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar
        role={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:px-12">
        {/* Role Switcher - Demo Only */}
        <div className="fixed bottom-8 right-8 bg-white/90 backdrop-blur-sm p-1.5 rounded-xl shadow-2xl border border-gray-200 z-[100] flex items-center gap-1">
          <button
            onClick={() => setUserRole("VOLUNTEER")}
            className={`px-4 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${userRole === "VOLUNTEER" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:text-gray-600"}`}
          >
            Volunteer
          </button>
          <button
            onClick={() => setUserRole("NGO")}
            className={`px-4 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${userRole === "NGO" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-gray-400 hover:text-gray-600"}`}
          >
            NGO
          </button>
        </div>

        {renderContent()}

        <footer className="mt-20 pt-10 border-t border-gray-200 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.25em]">
            © 2025 SkillBridge • CONNECTING SKILLS TO MISSIONS
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
