import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/auth/login', {
                email,
                password
            });

            const { token, name, role } = response.data;

            login({ name, email, role }, token);
            navigate('/dashboard');

        } catch (err) {
            setError('Invalid email or password!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Logo */}
                <h1 style={styles.logo}>🏥 MediTrack AI</h1>
                <p style={styles.subtitle}>Hospital Management System</p>

                {/* Error */}
                {error && <p style={styles.error}>{error}</p>}

                {/* Form */}
                <form onSubmit={handleLogin}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        style={loading ? styles.buttonDisabled : styles.button}
                        type="submit"
                        disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* Test credentials */}
                <div style={styles.hint}>
                    <p>Test Credentials:</p>
                    <p>Email: admin@meditrack.com</p>
                    <p>Password: admin123</p>
                    <p style={styles.loginLink}>
                        Don't have an account?{' '}
                        <span
                            style={styles.link}
                            onClick={() => navigate('/register')}>
                            Register here
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f4f8',
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '400px',
    },
    logo: {
        textAlign: 'center',
        color: '#2b6cb0',
        marginBottom: '5px',
    },
    subtitle: {
        textAlign: 'center',
        color: '#718096',
        marginBottom: '30px',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '6px',
        color: '#4a5568',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid #cbd5e0',
        fontSize: '14px',
        boxSizing: 'border-box',
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#2b6cb0',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    buttonDisabled: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#90cdf4',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'not-allowed',
        marginTop: '10px',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: '15px',
    },
    hint: {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#ebf8ff',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#2b6cb0',
        textAlign: 'center',
    },
    loginLink: {
        textAlign: 'center',
        marginTop: '20px',
        color: '#718096',
        fontSize: '14px',
    },
    link: {
        color: '#2b6cb0',
        cursor: 'pointer',
        fontWeight: 'bold',
    }
};

export default Login;