const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_URL}/auth/login/access-token`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Login failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    return data;
}

export async function register(email: string, password: string, fullName: string) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Registration failed');
    }

    return await res.json();
}

export async function getMe() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) {
         localStorage.removeItem('token');
         return null;
    }

    return await res.json();
}

export function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}
