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
export const loginUser = async (credentials) => {
    try {
        const response = await fetch(`${AUTH_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
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
