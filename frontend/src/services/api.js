const BASE_URL = 'http://localhost:5000/api';

// ─── HELPERS ────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        return { success: false, message: data.message || 'Something went wrong', status: response.status };
    }
    return { success: true, ...data };
};

// ─── AUTH ────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { username, email, password, fullName, iam, location, skills[], organizationName, organizationDescription, websiteUrl }
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error. Is the backend running?' };
    }
};

// POST /api/auth/login
// Body: { email, password }
// Response: { success, data: { token, user: { id, username, email, iam, fullName } } }
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await handleResponse(response);
        if (result.success && result.data?.token) {
            localStorage.setItem('token', result.data.token);
        }
        return result;
    } catch {
        return { success: false, message: 'Network error. Is the backend running?' };
    }
};

// GET /api/auth/profile
// Response: { success, data: { id, username, fullName, email, iam, location, skills, bio, organizationName, websiteUrl } }
export const getProfile = async () => {
    try {
        const response = await fetch(`${BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error while fetching profile.' };
    }
};

// PUT /api/auth/profile
// Body: { fullName, location, skills, bio, organizationName, organizationDescription, websiteUrl }
export const updateProfile = async (profileData) => {
    try {
        const response = await fetch(`${BASE_URL}/auth/profile`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(profileData)
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error while updating profile.' };
    }
};

export const logoutUser = () => {
    localStorage.removeItem('token');
};

// ─── NGO DASHBOARD ──────────────────────────────────────────────
// GET /api/ngo/dashboard
// Response: { success, data: { metrics: {...}, recentApplications: [] } }
export const getNgoDashboardData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/dashboard`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching NGO dashboard.' };
    }
};

// ─── NGO OPPORTUNITIES ──────────────────────────────────────────
// GET /api/ngo/opportunities
// Response: { success, data: [ { id, title, description, requiredSkills, location, duration, status, createdAt } ] }
export const getNgoOpportunities = async () => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/opportunities`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching NGO opportunities.' };
    }
};

// POST /api/ngo/opportunities
// Body: { title, description, requiredSkills[], location, duration, status }
// Response: { success, data: { id, title, ... }, message }
export const createOpportunity = async (oppData) => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/opportunities`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(oppData)
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error creating opportunity.' };
    }
};

// PUT /api/ngo/opportunities/:id
// Body: { title, description, requiredSkills[], location, duration, status }
export const updateOpportunity = async (opportunityId, oppData) => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/opportunities/${opportunityId}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(oppData)
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error updating opportunity.' };
    }
};

// DELETE /api/ngo/opportunities/:id
export const deleteOpportunity = async (opportunityId) => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/opportunities/${opportunityId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error deleting opportunity.' };
    }
};

// ─── NGO APPLICATIONS ───────────────────────────────────────────
// GET /api/ngo/applications
// Response: { success, data: [ { id, volunteerName, volunteerSkills, opportunityTitle, message, status, appliedAt } ] }
export const getNgoApplications = async () => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/applications`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching NGO applications.' };
    }
};

// PUT /api/ngo/applications/:id/status
// Body: { status: 'accepted' | 'rejected' | 'pending' }
export const updateApplicationStatus = async (applicationId, status) => {
    try {
        const response = await fetch(`${BASE_URL}/ngo/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify({ status })
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error updating application status.' };
    }
};

// ─── VOLUNTEER DASHBOARD ─────────────────────────────────────────
// GET /api/volunteer/dashboard
// Response: { success, data: { appliedCount, acceptedCount, pendingCount, skillsCount, recentMessages, applications[] } }
export const getVolunteerDashboardData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/volunteer/dashboard`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching volunteer dashboard.' };
    }
};

// ─── VOLUNTEER OPPORTUNITIES ─────────────────────────────────────
// GET /api/volunteer/opportunities?skill=React&location=Remote&status=open
// Response: { success, data: [ { id, title, description, requiredSkills, location, duration, status, ngoName, createdAt } ] }
export const getVolunteerOpportunities = async (filters = {}) => {
    try {
        // Remove empty filter values
        const cleanFilters = Object.fromEntries(
            Object.entries(filters).filter(([, v]) => v && v !== '')
        );
        const queryParams = new URLSearchParams(cleanFilters).toString();
        const url = `${BASE_URL}/volunteer/opportunities${queryParams ? `?${queryParams}` : ''}`;
        const response = await fetch(url, { headers: authHeaders() });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching opportunities.' };
    }
};

// ─── APPLY FOR OPPORTUNITY ────────────────────────────────────────
// POST /api/volunteer/apply
// Body: { opportunityId, message }
export const applyForOpportunity = async (opportunityId, message = '') => {
    try {
        const response = await fetch(`${BASE_URL}/volunteer/apply`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ opportunityId, message })
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error applying for opportunity.' };
    }
};

// ─── VOLUNTEER APPLICATIONS ───────────────────────────────────────
// GET /api/volunteer/applications
// Response: { success, data: [ { id, opportunityId, opportunityTitle, status, message, appliedAt, location, duration, ngoName } ] }
export const getVolunteerApplications = async () => {
    try {
        const response = await fetch(`${BASE_URL}/volunteer/applications`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching your applications.' };
    }
};

// ─── AI CHAT ─────────────────────────────────────────────────────
// POST /api/chat
// Body: { message }
// Response: { reply }
export const chatWithAI = async (message) => {
    try {
        const response = await fetch(`${BASE_URL}/chat`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ message })
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error chatting with AI.' };
    }
};

// POST /api/chat/match
// Body: { skills[], iam, userId? }
export const getAIRecommendations = async (skills, iam, userId = null) => {
    try {
        const payload = { skills, iam };
        if (userId) payload.userId = userId;

        const response = await fetch(`${BASE_URL}/chat/match`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching AI matches.' };
    }
};

// ─── MESSAGES ────────────────────────────────────────────────────
// GET /api/messages
export const getMessages = async () => {
    try {
        const response = await fetch(`${BASE_URL}/messages`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching messages.' };
    }
};

// POST /api/messages
// Body: { receiverId, opportunityId, content }
export const sendMessage = async (receiverId, opportunityId, content) => {
    try {
        const response = await fetch(`${BASE_URL}/messages`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ receiverId, opportunityId, content })
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error sending message.' };
    }
};

// GET /api/messages/:otherId
export const getConversation = async (otherId, opportunityId = null) => {
    try {
        let url = `${BASE_URL}/messages/${otherId}`;
        if (opportunityId) {
            url += `?opportunityId=${opportunityId}`;
        }
        const response = await fetch(url, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching conversation.' };
    }
};

// PUT /api/messages/:otherId/read
export const markConversationAsRead = async (otherId) => {
    try {
        const response = await fetch(`${BASE_URL}/messages/${otherId}/read`, {
            method: 'PUT',
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error marking conversation as read.' };
    }
};

// ─── PUBLIC OPPORTUNITIES ─────────────────────────────────────────
// GET /api/opportunities  (no auth needed)
// GET /api/opportunities/:id (no auth needed)
export const getPublicOpportunities = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${BASE_URL}/opportunities${queryParams ? `?${queryParams}` : ''}`;
        const response = await fetch(url);
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching opportunities.' };
    }
};

export const getOpportunityById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/opportunities/${id}`);
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching opportunity.' };
    }
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────
// GET /api/notifications
// Response: { success, data: [ { id, type, message, isRead, createdAt, relatedId } ], unreadCount }
export const getNotifications = async () => {
    try {
        const response = await fetch(`${BASE_URL}/notifications`, {
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error fetching notifications.', data: [], unreadCount: 0 };
    }
};

// PUT /api/notifications/:id/read
export const markNotificationRead = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error.' };
    }
};

// PUT /api/notifications/read-all
export const markAllNotificationsRead = async () => {
    try {
        const response = await fetch(`${BASE_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: authHeaders()
        });
        return await handleResponse(response);
    } catch {
        return { success: false, message: 'Network error.' };
    }
};

