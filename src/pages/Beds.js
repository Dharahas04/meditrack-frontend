import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function Beds() {
    const { user } = useAuth();
    const canCreateBed = user?.role === 'ADMIN';

    const [beds, setBeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [error, setError] = useState('');

    const [newBed, setNewBed] = useState({
        wardId: '',
        bedNumber: '',
        status: 'AVAILABLE',
    });

    useEffect(() => {
        fetchBeds();
    }, []);

    const fetchBeds = () => {
        setLoading(true);
        API.get('/beds')
            .then((res) => setBeds(res.data || []))
            .catch((err) => console.log(err))
            .finally(() => setLoading(false));
    };

    const handleStatusChange = async (id, status) => {
        try {
            await API.put(`/beds/${id}/status?status=${status}`);
            fetchBeds();
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateBed = async (e) => {
        e.preventDefault();
        setError('');

        const wardId = Number(newBed.wardId);
        if (!wardId || !newBed.bedNumber.trim()) {
            setError('Ward ID and Bed Number are required');
            return;
        }

        try {
            await API.post('/beds', {
                ward: { id: wardId },
                bedNumber: newBed.bedNumber.trim(),
                status: newBed.status,
            });

            setNewBed({ wardId: '', bedNumber: '', status: 'AVAILABLE' });
            setShowAddForm(false);
            fetchBeds();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : 'Unable to add bed')
            );
        }
    };

    const available = beds.filter((b) => b.status === 'AVAILABLE').length;
    const occupied = beds.filter((b) => b.status === 'OCCUPIED').length;
    const maintenance = beds.filter((b) => b.status === 'MAINTENANCE').length;

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.heading}>🛏️ Bed Management</h1>
                {canCreateBed && (
                    <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
                        {showAddForm ? 'Cancel' : '+ Add Bed'}
                    </button>
                )}
            </div>

            {canCreateBed && showAddForm && (
                <div style={styles.formCard}>
                    <h3>Add Bed</h3>
                    {error && <p style={styles.error}>{error}</p>}
                    <form onSubmit={handleCreateBed} style={styles.formGrid}>
                        <input
                            style={styles.input}
                            type="number"
                            placeholder="Ward ID (from DB)"
                            value={newBed.wardId}
                            onChange={(e) => setNewBed({ ...newBed, wardId: e.target.value })}
                            required
                        />
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Bed Number (e.g. B-101)"
                            value={newBed.bedNumber}
                            onChange={(e) => setNewBed({ ...newBed, bedNumber: e.target.value })}
                            required
                        />
                        <select
                            style={styles.input}
                            value={newBed.status}
                            onChange={(e) => setNewBed({ ...newBed, status: e.target.value })}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="OCCUPIED">Occupied</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        <button style={styles.submitBtn} type="submit">Save Bed</button>
                    </form>
                </div>
            )}

            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard('#c6f6d5', '#276749')}>
                    <h2>{available}</h2>
                    <p>Available</p>
                </div>
                <div style={styles.summaryCard('#fed7d7', '#9b2c2c')}>
                    <h2>{occupied}</h2>
                    <p>Occupied</p>
                </div>
                <div style={styles.summaryCard('#fefcbf', '#744210')}>
                    <h2>{maintenance}</h2>
                    <p>Maintenance</p>
                </div>
                <div style={styles.summaryCard('#ebf8ff', '#2b6cb0')}>
                    <h2>{beds.length}</h2>
                    <p>Total Beds</p>
                </div>
            </div>

            {loading ? (
                <p>Loading beds...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Bed Number</th>
                                <th style={styles.th}>Ward</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beds.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={styles.noData}>No beds found</td>
                                </tr>
                            ) : (
                                beds.map((b) => (
                                    <tr key={b.id} style={styles.tableRow}>
                                        <td style={styles.td}>{b.bedNumber}</td>
                                        <td style={styles.td}>{b.ward?.name}</td>
                                        <td style={styles.td}>
                                            <span style={
                                                b.status === 'AVAILABLE'
                                                    ? styles.available
                                                    : b.status === 'OCCUPIED'
                                                        ? styles.occupied
                                                        : styles.maintenance
                                            }>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <select
                                                style={styles.select}
                                                value={b.status}
                                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                            >
                                                <option value="AVAILABLE">Available</option>
                                                <option value="OCCUPIED">Occupied</option>
                                                <option value="MAINTENANCE">Maintenance</option>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    heading: { color: '#2b6cb0' },
    addBtn: {
        backgroundColor: '#2b6cb0', color: 'white', border: 'none', padding: '10px 14px',
        borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
    },
    formCard: {
        backgroundColor: 'white', padding: '16px', borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '20px'
    },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', alignItems: 'center' },
    input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
    submitBtn: {
        backgroundColor: '#38a169', color: 'white', border: 'none', padding: '9px 12px',
        borderRadius: '6px', cursor: 'pointer'
    },
    error: { color: '#c53030', marginBottom: '8px' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' },
    summaryCard: (bg, color) => ({ backgroundColor: bg, color, padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }),
    tableCard: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#ebf8ff' },
    th: { padding: '12px', textAlign: 'left', color: '#2b6cb0', fontWeight: 'bold', fontSize: '13px' },
    tableRow: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', fontSize: '13px', color: '#4a5568' },
    noData: { padding: '20px', textAlign: 'center', color: '#718096' },
    available: { backgroundColor: '#c6f6d5', color: '#276749', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    occupied: { backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    maintenance: { backgroundColor: '#fefcbf', color: '#744210', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    select: { padding: '5px', borderRadius: '4px', border: '1px solid #cbd5e0', fontSize: '12px', cursor: 'pointer' },
};

export default Beds;
