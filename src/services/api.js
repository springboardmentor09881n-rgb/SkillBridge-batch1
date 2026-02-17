const API_URL = 'http://localhost:5000/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        return {
            success: false,
            message: data.message || 'Something went wrong',
            errors: data.errors || null,
            status: response.status
        };
    }
    return {
        success: true,
        ...data
    };
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error. Please make sure the backend is running.',
        };
    }
};

export const loginUser = async (credentials, role) => {
    // credentials contains identifier and password
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...credentials, role }),
        });
        return await handleResponse(response);
    } catch {
        return {
            success: false,
            message: 'Network error. Please make sure the backend is running.',
        };
    }
};

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
