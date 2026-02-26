import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function Attendance() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { user } = useAuth();

    const isAdmin = user?.role === 'ADMIN';
    const canMark = ['DOCTOR', 'NURSE', 'LAB_TECHNICIAN'].includes(user?.role);

    const fetchAttendance = useCallback(() => {
        setLoading(true);

        const endpoint =
            isAdmin ? '/attendance/report' : `/attendance/report?userId=${user?.id}`;

        API.get(endpoint)
            .then((res) => setAttendance(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    }, [isAdmin, user?.id]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleCheckIn = async () => {
        if (!canMark || !user?.id) return;
        try {
            await API.post(`/attendance/checkin/${user.id}`);
            setMessage('Checked in successfully');
            fetchAttendance();
        } catch (err) {
            setMessage(err?.response?.data || 'Unable to check in');
        }
    };

    const handleCheckOut = async () => {
        if (!canMark || !user?.id) return;
        try {
            await API.put(`/attendance/checkout/${user.id}`);
            setMessage('Checked out successfully');
            fetchAttendance();
        } catch (err) {
            setMessage(err?.response?.data || 'Unable to check out');
        }
    };

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter((a) => a.date === today);

    const present = attendance.filter((a) => a.status === 'PRESENT').length;
    const absent = attendance.filter((a) => a.status === 'ABSENT').length;
    const late = attendance.filter((a) => a.status === 'LATE').length;
    const halfDay = attendance.filter((a) => a.status === 'HALF_DAY').length;

    return (
        <div>
            <h1 style={styles.heading}>Attendance</h1>

            {canMark && (
                <div style={styles.actionCard}>
                    <h3 style={styles.actionTitle}>Mark Attendance</h3>
                    <div style={styles.actionButtons}>
                        <button style={styles.checkInBtn} onClick={handleCheckIn}>
                            Check In
                        </button>
                        <button style={styles.checkOutBtn} onClick={handleCheckOut}>
                            Check Out
                        </button>
                    </div>
                    {message && <p style={styles.message}>{message}</p>}
                </div>
            )}

            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <h2 style={{ color: '#276749' }}>{present}</h2>
                    <p style={{ color: '#276749' }}>Present</p>
                </div>
                <div style={styles.summaryCard}>
                    <h2 style={{ color: '#9b2c2c' }}>{absent}</h2>
                    <p style={{ color: '#9b2c2c' }}>Absent</p>
                </div>
                <div style={styles.summaryCard}>
                    <h2 style={{ color: '#744210' }}>{late}</h2>
                    <p style={{ color: '#744210' }}>Late</p>
                </div>
                <div style={styles.summaryCard}>
                    <h2 style={{ color: '#553c9a' }}>{halfDay}</h2>
                    <p style={{ color: '#553c9a' }}>Half Day</p>
                </div>
                <div style={styles.summaryCard}>
                    <h2 style={{ color: '#2b6cb0' }}>{todayAttendance.length}</h2>
                    <p style={{ color: '#2b6cb0' }}>Today</p>
                </div>
            </div>

            {loading ? (
                <p>Loading attendance...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Staff Name</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Check In</th>
                                <th style={styles.th}>Check Out</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={styles.noData}>
                                        No attendance records found
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((a) => (
                                    <tr key={a.id} style={styles.tableRow}>
                                        <td style={styles.td}>{a.user?.name}</td>
                                        <td style={styles.td}>{a.date}</td>
                                        <td style={styles.td}>{a.checkIn || '-'}</td>
                                        <td style={styles.td}>{a.checkOut || '-'}</td>
                                        <td style={styles.td}>
                                            <span
                                                style={
                                                    a.status === 'PRESENT'
                                                        ? styles.present
                                                        : a.status === 'ABSENT'
                                                            ? styles.absent
                                                            : a.status === 'LATE'
                                                                ? styles.late
                                                                : styles.halfday
                                                }
                                            >
                                                {a.status}
                                            </span>
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
    heading: { color: '#2b6cb0', marginBottom: '20px' },
    actionCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '20px',
    },
    actionTitle: { color: '#2d3748', marginBottom: '15px' },
    actionButtons: { display: 'flex', gap: '15px' },
    checkInBtn: {
        backgroundColor: '#38a169',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    checkOutBtn: {
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    message: { marginTop: '10px', color: '#2b6cb0', fontWeight: 'bold' },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '15px',
        marginBottom: '20px',
    },
    summaryCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
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
    td: { padding: '12px', fontSize: '13px', color: '#4a5568' },
    noData: { padding: '20px', textAlign: 'center', color: '#718096' },
    present: {
        backgroundColor: '#c6f6d5',
        color: '#276749',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    absent: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    late: {
        backgroundColor: '#fefcbf',
        color: '#744210',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    halfday: {
        backgroundColor: '#e9d8fd',
        color: '#553c9a',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
};

export default Attendance;
