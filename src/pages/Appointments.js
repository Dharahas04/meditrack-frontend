import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
    });

    const { user } = useAuth();

    const canBook = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';
    const canUpdateStatus =
        user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST' || user?.role === 'DOCTOR';

    const fetchAppointments = useCallback(() => {
        setLoading(true);

        if (user?.role === 'DOCTOR' && user?.id) {
            API.get(`/appointments/doctor/${user.id}`)
                .then((res) => {
                    setAppointments(res.data || []);
                })
                .catch((err) => console.log(err))
                .finally(() => setLoading(false));
        } else {
            API.get('/appointments')
                .then((res) => {
                    setAppointments(res.data || []);
                })
                .catch((err) => console.log(err))
                .finally(() => setLoading(false));
        }
    }, [user?.role, user?.id]);

    const fetchDoctors = useCallback(() => {
        API.get('/users?role=DOCTOR')
            .then((res) => setDoctors(res.data || []))
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, [fetchAppointments, fetchDoctors]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!canBook) return;

        setError('');

        const patientId = Number(formData.patientId);
        const doctorId = Number(formData.doctorId);

        if (!patientId || !doctorId) {
            setError('Please enter valid patient and doctor');
            return;
        }

        try {
            await API.post('/appointments', {
                patient: { id: patientId },
                doctor: { id: doctorId },
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                reason: formData.reason?.trim() || null,
            });

            setShowForm(false);
            setFormData({
                patientId: '',
                doctorId: '',
                appointmentDate: '',
                appointmentTime: '',
                reason: '',
            });
            fetchAppointments();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : 'Booking failed');
            setError(msg);
        }
    };

    const handleStatusChange = async (id, status) => {
        if (!canUpdateStatus) return;
        try {
            await API.put(`/appointments/${id}/status?status=${status}`);
            fetchAppointments();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.heading}>Appointments</h1>

                {canBook ? (
                    <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Book Appointment'}
                    </button>
                ) : (
                    <p style={styles.infoText}>View only</p>
                )}
            </div>

            {canBook && showForm && (
                <div style={styles.formCard}>
                    <h3>Book New Appointment</h3>
                    {error && <p style={styles.error}>{error}</p>}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Patient ID</label>
                                <input
                                    style={styles.input}
                                    type="number"
                                    name="patientId"
                                    placeholder="Enter patient ID"
                                    value={formData.patientId}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Doctor</label>
                                <select
                                    style={styles.input}
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} {d.department ? `- ${d.department.name || d.department}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Date</label>
                                <input
                                    style={styles.input}
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Time</label>
                                <input
                                    style={styles.input}
                                    type="time"
                                    name="appointmentTime"
                                    value={formData.appointmentTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Reason</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="reason"
                                    placeholder="Reason for appointment"
                                    value={formData.reason}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button style={styles.submitBtn} type="submit">
                            Book Appointment
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading appointments...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Patient</th>
                                <th style={styles.th}>Doctor</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Time</th>
                                <th style={styles.th}>Reason</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={styles.noData}>
                                        No appointments found
                                    </td>
                                </tr>
                            ) : (
                                appointments.map((a) => (
                                    <tr key={a.id} style={styles.tableRow}>
                                        <td style={styles.td}>{a.patient?.name}</td>
                                        <td style={styles.td}>{a.doctor?.name}</td>
                                        <td style={styles.td}>{a.appointmentDate}</td>
                                        <td style={styles.td}>{a.appointmentTime}</td>
                                        <td style={styles.td}>{a.reason}</td>
                                        <td style={styles.td}>
                                            <span
                                                style={
                                                    a.status === 'SCHEDULED'
                                                        ? styles.scheduled
                                                        : a.status === 'COMPLETED'
                                                            ? styles.completed
                                                            : a.status === 'NO_SHOW'
                                                                ? styles.noshow
                                                                : styles.cancelled
                                                }
                                            >
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {canUpdateStatus ? (
                                                <select
                                                    style={styles.select}
                                                    value={a.status}
                                                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                                >
                                                    <option value="SCHEDULED">Scheduled</option>
                                                    <option value="COMPLETED">Completed</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                    <option value="NO_SHOW">No Show</option>
                                                </select>
                                            ) : (
                                                <span style={styles.readOnly}>View Only</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
    infoText: {
        color: '#4a5568',
        fontSize: '13px',
        backgroundColor: '#edf2f7',
        padding: '8px 10px',
        borderRadius: '6px',
    },
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
    error: {
        color: '#c53030',
        marginBottom: '12px',
        fontSize: '13px',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
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
    submitBtn: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#ebf8ff' },
    th: {
        padding: '12px',
        textAlign: 'left',
        color: '#2b6cb0',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    tableRow: { borderBottom: '1px solid #e2e8f0' },
    td: {
        padding: '12px',
        fontSize: '13px',
        color: '#4a5568',
    },
    noData: {
        padding: '20px',
        textAlign: 'center',
        color: '#718096',
    },
    scheduled: {
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    completed: {
        backgroundColor: '#c6f6d5',
        color: '#276749',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    cancelled: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    noshow: {
        backgroundColor: '#fefcbf',
        color: '#744210',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    select: {
        padding: '5px',
        borderRadius: '4px',
        border: '1px solid #cbd5e0',
        fontSize: '12px',
        cursor: 'pointer',
    },
    readOnly: {
        color: '#718096',
        fontSize: '12px',
    },
};

export default Appointments;
