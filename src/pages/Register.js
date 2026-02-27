import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'DOCTOR',
        phone: '',
        departmentId: '',
        shift: 'MORNING',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);

    const navigate = useNavigate();
    const shiftRoles = ['DOCTOR', 'NURSE', 'RECEPTIONIST'];

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await API.get('/departments');
                setDepartments(res.data || []);
            } catch {
                setDepartments([]);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'role') {
            const requiresShiftForRole = shiftRoles.includes(value);
            setFormData((prev) => ({
                ...prev,
                role: value,
                departmentId: value === 'DOCTOR' ? prev.departmentId : '',
                shift: requiresShiftForRole ? (prev.shift || 'MORNING') : '',
            }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const isDoctor = formData.role === 'DOCTOR';
        const requiresShift = shiftRoles.includes(formData.role);

        const supportDept = departments.find(
            (d) => (d.name || '').trim().toUpperCase() === 'GENERAL_SUPPORT'
        );

        if (isDoctor && !formData.departmentId) {
            setError('Please select department for doctor');
            setLoading(false);
            return;
        }

        if (!isDoctor && !supportDept?.id) {
            setError('GENERAL_SUPPORT department missing in database');
            setLoading(false);
            return;
        }

        if (requiresShift && !formData.shift) {
            setError('Please select shift');
            setLoading(false);
            return;
        }

        const payload = {
            ...formData,
            departmentId: isDoctor
                ? Number(formData.departmentId)
                : Number(supportDept.id),
            shift: requiresShift ? formData.shift : null,
        };

        try {
            await API.post('/auth/register', payload);
            setSuccess('Registered successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const backendMsg =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : '');
            setError(backendMsg || 'Registration failed! Try again.');
        } finally {
            setLoading(false);
        }
    };

    const showDoctorDepartment = formData.role === 'DOCTOR';
    const showShift = shiftRoles.includes(formData.role);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h1 style={styles.logo}>🏥 MediTrack AI</h1>
                <p style={styles.subtitle}>Create your account</p>

                {error && <p style={styles.error}>{error}</p>}
                {success && <p style={styles.success}>{success}</p>}

                <form onSubmit={handleRegister}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Role</label>
                        <select
                            style={styles.input}
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="DOCTOR">Doctor</option>
                            <option value="NURSE">Nurse</option>
                            <option value="RECEPTIONIST">Receptionist</option>
                            <option value="LAB_TECHNICIAN">Lab Technician</option>

                        </select>
                    </div>

                    {showDoctorDepartment && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Department</label>
                            <select
                                style={styles.input}
                                name="departmentId"
                                value={formData.departmentId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Department</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!showDoctorDepartment && (
                        <p style={styles.note}>Department: GENERAL_SUPPORT (auto-assigned)</p>
                    )}

                    {showShift && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Shift</label>
                            <select
                                style={styles.input}
                                name="shift"
                                value={formData.shift}
                                onChange={handleChange}
                                required
                            >
                                <option value="MORNING">Morning</option>
                                <option value="AFTERNOON">Afternoon</option>
                                <option value="NIGHT">Night</option>
                            </select>
                        </div>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Phone</label>
                        <input
                            style={styles.input}
                            type="text"
                            name="phone"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        style={loading ? styles.buttonDisabled : styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p style={styles.loginLink}>
                    Already have an account?{' '}
                    <span style={styles.link} onClick={() => navigate('/login')}>
                        Login here
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
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
        marginBottom: '15px',
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
    note: {
        marginBottom: '15px',
        color: '#4a5568',
        fontSize: '13px',
        backgroundColor: '#edf2f7',
        padding: '8px 10px',
        borderRadius: '6px',
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
    success: {
        color: 'green',
        textAlign: 'center',
        marginBottom: '15px',
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
    },
};

export default Register;
