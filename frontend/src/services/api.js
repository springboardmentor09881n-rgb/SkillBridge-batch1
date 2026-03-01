const AUTH_URL = 'http://localhost:5000/api/auth';
const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        return {
            success: false,
            message: data.message || 'Something went wrong',
            status: response.status
        };
    }

    return {
        success: true,
        ...data
    };
};

// ================= REGISTER =================
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${AUTH_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        return await handleResponse(response);
    } catch (error) {
        return {
            success: false,
            message: 'Network error. Backend not running.',
        };
    }
};

// ================= LOGIN =================
export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const result = await handleResponse(response);

        // Store token after successful login
        if (result.success && result.data?.token) {
            localStorage.setItem('token', result.data.token);
        }

        return result;

    } catch (error) {
        return {
            success: false,
            message: 'Network error. Backend not running.',
        };
    }
};

// ================= GET PROFILE =================
export const getProfile = async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${AUTH_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return await handleResponse(response);

    } catch (error) {
        return {
            success: false,
            message: 'Network error while fetching profile.',
        };
    }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (profileData) => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${AUTH_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        return await handleResponse(response);

    } catch (error) {
        return {
            success: false,
            message: 'Network error while updating profile.',
        };
    }
};

// ================= LOGOUT =================
export const logoutUser = () => {
    localStorage.removeItem('token');
};

// ================= DASHBOARD DATA =================
export const getVolunteerDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/volunteer/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while fetching volunteer dashboard data.',
        };
    }
};

export const getNgoDashboardData = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/ngo/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while fetching NGO dashboard data.',
        };
    }
};

// ================= NGO OPPORTUNITIES =================
export const getNgoOpportunities = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/ngo/opportunities`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while fetching NGO opportunities.',
        };
    }
};

export const createOpportunity = async (oppData) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/ngo/opportunities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(oppData)
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while creating opportunity.',
        };
    }
};

// ================= NGO APPLICATIONS =================
export const getNgoApplications = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/ngo/applications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while fetching NGO applications.',
        };
    }
};

export const updateApplicationStatus = async (applicationId, status) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/ngo/applications/${applicationId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while updating application status.',
        };
    }
};
// ================= VOLUNTEER ACTIONS =================
export const applyForOpportunity = async (opportunityId, message = "") => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/volunteer/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ opportunityId, message })
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while applying for opportunity.',
        };
    }
};

export const getVolunteerApplications = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/volunteer/applications`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error while fetching your applications.',
        };
    }
};
