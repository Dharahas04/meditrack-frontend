import { useState, useEffect } from 'react';
import API from '../services/api';

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
    });

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchAppointments = () => {
        API.get('/appointments')
            .then(res => {
                setAppointments(res.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    };

    const fetchDoctors = () => {
        API.get('/users')
            .then(res => {
                const doctorList = res.data.filter(
                    u => u.role === 'DOCTOR'
                );
                setDoctors(doctorList);
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/appointments', {
                ...formData,
                patientId: Number(formData.patientId),
                doctorId: Number(formData.doctorId),
            });
            setShowForm(false);
            fetchAppointments();
        } catch (err) {
            console.log(err);
        }
    };

    const handleStatusChange = async (id, status) => {
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
                <h1 style={styles.heading}>📅 Appointments</h1>
                <button
                    style={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Book Appointment'}
                </button>
            </div>

            {/* Book Appointment Form */}
            {showForm && (
                <div style={styles.formCard}>
                    <h3>Book New Appointment</h3>
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
                                    required>
                                    <option value="">Select Doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} - {d.department?.name}
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

            {/* Appointments Table */}
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
                                        <td style={styles.td}>
                                            {a.patient?.name}
                                        </td>
                                        <td style={styles.td}>
                                            {a.doctor?.name}
                                        </td>
                                        <td style={styles.td}>
                                            {a.appointmentDate}
                                        </td>
                                        <td style={styles.td}>
                                            {a.appointmentTime}
                                        </td>
                                        <td style={styles.td}>
                                            {a.reason}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={
                                                a.status === 'SCHEDULED'
                                                    ? styles.scheduled
                                                    : a.status === 'COMPLETED'
                                                        ? styles.completed
                                                        : a.status === 'NO_SHOW'
                                                            ? styles.noshow
                                                            : styles.cancelled
                                            }>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <select
                                                style={styles.select}
                                                value={a.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        a.id,
                                                        e.target.value
                                                    )
                                                }>
                                                <option value="SCHEDULED">
                                                    Scheduled
                                                </option>
                                                <option value="COMPLETED">
                                                    Completed
                                                </option>
                                                <option value="CANCELLED">
                                                    Cancelled
                                                </option>
                                                <option value="NO_SHOW">
                                                    No Show
                                                </option>
                                            </select>
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
};

export default Appointments;