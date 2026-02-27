import { useState, useEffect } from 'react';
import API from '../services/api';

function Alerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: 'STAFF_SHORTAGE',
        message: '',
        severity: 'MEDIUM',
    });

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = () => {
        setLoading(true);
        setError('');
        API.get('/alerts')
            .then((res) => setAlerts(res.data || []))
            .catch(() => {
                setAlerts([]);
                setError('Failed to load alerts');
            })
            .finally(() => setLoading(false));
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/alerts', formData);
            setShowForm(false);
            fetchAlerts();
        } catch (err) {
            console.log(err);
        }
    };

    const handleResolve = async (id) => {
        try {
            await API.put(`/alerts/${id}/resolve`);
            fetchAlerts();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            {error && <p style={{ color: '#c53030', marginBottom: '12px' }}>{error}</p>}

            <div style={styles.header}>
                <h1 style={styles.heading}>🔔 Alerts</h1>
                <button
                    style={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Create Alert'}
                </button>
            </div>


            {/* Create Alert Form */}
            {showForm && (
                <div style={styles.formCard}>
                    <h3>Create New Alert</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Alert Type</label>
                                <select
                                    style={styles.input}
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}>
                                    <option value="STAFF_SHORTAGE">
                                        Staff Shortage
                                    </option>
                                    <option value="BED_FULL">
                                        Bed Full
                                    </option>
                                    <option value="NO_SHOW_RISK">
                                        No Show Risk
                                    </option>
                                    <option value="CRITICAL_PATIENT">
                                        Critical Patient
                                    </option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Severity</label>
                                <select
                                    style={styles.input}
                                    name="severity"
                                    value={formData.severity}
                                    onChange={handleChange}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Message</label>
                            <textarea
                                style={styles.textarea}
                                name="message"
                                placeholder="Alert message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button style={styles.submitBtn} type="submit">
                            Create Alert
                        </button>
                    </form>
                </div>
            )}

            {/* Alerts List */}
            {loading ? (
                <p>Loading alerts...</p>
            ) : (
                <div>
                    {alerts.length === 0 ? (
                        <div style={styles.emptyCard}>
                            <p>✅ No active alerts!</p>
                        </div>
                    ) : (
                        alerts.map((a) => (
                            <div key={a.id} style={{
                                ...styles.alertCard,
                                borderLeft: `4px solid ${a.severity === 'CRITICAL' ? '#e53e3e'
                                    : a.severity === 'HIGH' ? '#dd6b20'
                                        : a.severity === 'MEDIUM' ? '#d69e2e'
                                            : '#38a169'
                                    }`
                            }}>
                                <div style={styles.alertHeader}>
                                    <div>
                                        <span style={{
                                            ...styles.alertType,
                                            backgroundColor:
                                                a.severity === 'CRITICAL'
                                                    ? '#fed7d7'
                                                    : a.severity === 'HIGH'
                                                        ? '#feebc8'
                                                        : a.severity === 'MEDIUM'
                                                            ? '#fefcbf'
                                                            : '#c6f6d5',
                                            color:
                                                a.severity === 'CRITICAL'
                                                    ? '#9b2c2c'
                                                    : a.severity === 'HIGH'
                                                        ? '#7b341e'
                                                        : a.severity === 'MEDIUM'
                                                            ? '#744210'
                                                            : '#276749',
                                        }}>
                                            {a.severity}
                                        </span>
                                        <span style={styles.alertTypeText}>
                                            {a.type?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <button
                                        style={styles.resolveBtn}
                                        onClick={() => handleResolve(a.id)}>
                                        ✅ Resolve
                                    </button>
                                </div>
                                <p style={styles.alertMessage}>{a.message}</p>
                                <p style={styles.alertTime}>
                                    {new Date(a.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    heading: { color: '#2b6cb0' },
    addBtn: {
        backgroundColor: '#2b6cb0',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    formCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '20px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
    },
    inputGroup: { marginBottom: '15px' },
    label: {
        display: 'block',
        marginBottom: '5px',
        color: '#4a5568',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #cbd5e0',
        fontSize: '13px',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #cbd5e0',
        fontSize: '13px',
        boxSizing: 'border-box',
        height: '80px',
    },
    submitBtn: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    emptyCard: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#38a169',
        fontSize: '18px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    alertCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '15px',
    },
    alertHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
    },
    alertType: {
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: '10px',
    },
    alertTypeText: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#2d3748',
    },
    alertMessage: {
        color: '#4a5568',
        fontSize: '14px',
        margin: '5px 0',
    },
    alertTime: {
        color: '#a0aec0',
        fontSize: '12px',
    },
    resolveBtn: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
    },
};

export default Alerts;