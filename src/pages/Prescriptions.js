import { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

function Prescriptions({ presetPatient }) {
    const { user } = useAuth();
    const role = user?.role || '';

    const canCreate = role === 'DOCTOR';
    const canUpdate = role === 'DOCTOR';
    const canViewMine = role === 'DOCTOR' || role === 'NURSE';
    const canSearchByPatient = role === 'ADMIN';

    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [patientIdSearch, setPatientIdSearch] = useState('');

    const [formData, setFormData] = useState({
        patientId: '',
        nurseId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        route: '',
        instructions: '',
        startDate: '',
        endDate: '',
    });

    const fetchMine = useCallback(() => {
        if (!user?.id) {
            setPrescriptions([]);
            setLoading(false);
            return;
        }

        const endpoint =
            role === 'DOCTOR'
                ? `/prescriptions/doctor/${user.id}`
                : `/prescriptions/nurse/${user.id}`;

        setLoading(true);
        API.get(endpoint)
            .then((res) => setPrescriptions(res.data || []))
            .catch((err) => setError(err.response?.data || 'Failed to load prescriptions'))
            .finally(() => setLoading(false));
    }, [role, user?.id]);

    const fetchByPatient = useCallback((patientId) => {
        setLoading(true);
        API.get(`/prescriptions/patient/${patientId}`)
            .then((res) => setPrescriptions(res.data || []))
            .catch((err) => setError(err.response?.data || 'Failed to load prescriptions'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setError('');

        if (canViewMine) {
            fetchMine();
        } else {
            setPrescriptions([]);
            setLoading(false);
        }
    }, [canViewMine, fetchMine]);
    useEffect(() => {
        if (presetPatient?.patientId) {
            setFormData((prev) => ({ ...prev, patientId: String(presetPatient.patientId) }));
        }
    }, [presetPatient?.patientId]);

    useEffect(() => {
        if (!canCreate) return;

        API.get('/users?role=NURSE')
            .then((res) => setNurses(res.data || []))
            .catch(() => setNurses([]));
    }, [canCreate]);

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        const patientId = Number(formData.patientId);
        const doctorId = Number(user?.id);

        if (!patientId || !doctorId || !formData.medicationName.trim()) {
            setError('Patient ID and medication name are required');
            return;
        }

        try {
            await API.post('/prescriptions', {
                patientId,
                doctorId,
                nurseId: formData.nurseId ? Number(formData.nurseId) : null,
                medicationName: formData.medicationName,
                dosage: formData.dosage || null,
                frequency: formData.frequency || null,
                route: formData.route || null,
                instructions: formData.instructions || null,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
            });

            setShowForm(false);
            setFormData({
                patientId: '',
                nurseId: '',
                medicationName: '',
                dosage: '',
                frequency: '',
                route: '',
                instructions: '',
                startDate: '',
                endDate: '',
            });
            fetchMine();
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                (typeof err.response?.data === 'string' ? err.response.data : 'Create failed');
            setError(msg);
        }
    };

    const handleSearch = () => {
        setError('');
        const pid = Number(patientIdSearch);
        if (!pid) {
            setError('Enter valid patient ID');
            return;
        }
        fetchByPatient(pid);
    };

    const handleStop = async (id) => {
        try {
            await API.put(`/prescriptions/${id}/stop`);
            fetchMine();
        } catch (err) {
            setError(err.response?.data || 'Stop failed');
        }
    };

    const handleComplete = async (id) => {
        try {
            await API.put(`/prescriptions/${id}/complete`);
            fetchMine();
        } catch (err) {
            setError(err.response?.data || 'Complete failed');
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.heading}>Prescriptions</h1>

                {canCreate && (
                    <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Prescription'}
                    </button>
                )}
            </div>

            {canSearchByPatient && (
                <div style={styles.searchCard}>
                    <h3>Search by Patient ID</h3>
                    <div style={styles.searchRow}>
                        <input
                            style={styles.input}
                            type="number"
                            placeholder="Patient ID"
                            value={patientIdSearch}
                            onChange={(e) => setPatientIdSearch(e.target.value)}
                        />
                        <button style={styles.searchBtn} onClick={handleSearch}>Search</button>
                    </div>
                </div>
            )}

            {error && <p style={styles.error}>{error}</p>}

            {canCreate && showForm && (
                <div style={styles.formCard}>
                    <h3>Create Prescription</h3>
                    <form onSubmit={handleCreate}>
                        <div style={styles.formGrid}>
                            <input
                                style={styles.input}
                                type="number"
                                name="patientId"
                                value={formData.patientId}
                                onChange={handleChange}
                                readOnly={Boolean(presetPatient?.patientId)}
                            />
                            <select
                                style={styles.input}
                                name="nurseId"
                                value={formData.nurseId}
                                onChange={handleChange}
                            >
                                <option value="">Assign Nurse (Optional)</option>
                                {nurses.map((n) => (
                                    <option key={n.id} value={n.id}>{n.name}</option>
                                ))}
                            </select>
                            <input
                                style={styles.input}
                                name="medicationName"
                                placeholder="Medication Name"
                                value={formData.medicationName}
                                onChange={handleChange}
                                required
                            />
                            <input
                                style={styles.input}
                                name="dosage"
                                placeholder="Dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                            />
                            <input
                                style={styles.input}
                                name="frequency"
                                placeholder="Frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                            />
                            <input
                                style={styles.input}
                                name="route"
                                placeholder="Route"
                                value={formData.route}
                                onChange={handleChange}
                            />
                            <input
                                style={styles.input}
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                            <input
                                style={styles.input}
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>

                        <textarea
                            style={styles.textarea}
                            name="instructions"
                            placeholder="Instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                        />

                        <button style={styles.submitBtn} type="submit">Save Prescription</button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading prescriptions...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Patient</th>
                                <th style={styles.th}>Doctor</th>
                                <th style={styles.th}>Nurse</th>
                                <th style={styles.th}>Medication</th>
                                <th style={styles.th}>Dose/Freq</th>
                                <th style={styles.th}>Dates</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prescriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={styles.noData}>No prescriptions found</td>
                                </tr>
                            ) : (
                                prescriptions.map((p) => (
                                    <tr key={p.id} style={styles.tableRow}>
                                        <td style={styles.td}>{p.id}</td>
                                        <td style={styles.td}>{p.patient?.name}</td>
                                        <td style={styles.td}>{p.prescribedByDoctor?.name}</td>
                                        <td style={styles.td}>{p.assignedNurse?.name || '-'}</td>
                                        <td style={styles.td}>{p.medicationName}</td>
                                        <td style={styles.td}>{p.dosage || '-'} / {p.frequency || '-'}</td>
                                        <td style={styles.td}>{p.startDate || '-'} to {p.endDate || '-'}</td>
                                        <td style={styles.td}>
                                            <span
                                                style={
                                                    p.status === 'ACTIVE'
                                                        ? styles.active
                                                        : p.status === 'COMPLETED'
                                                            ? styles.completed
                                                            : styles.stopped
                                                }
                                            >
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {canUpdate && p.status === 'ACTIVE' ? (
                                                <>
                                                    <button style={styles.stopBtn} onClick={() => handleStop(p.id)}>
                                                        Stop
                                                    </button>
                                                    <button style={styles.completeBtn} onClick={() => handleComplete(p.id)}>
                                                        Complete
                                                    </button>
                                                </>
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
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    heading: { color: '#2b6cb0' },
    addBtn: {
        backgroundColor: '#2b6cb0',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
    },
    searchCard: {
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '16px',
    },
    searchRow: { display: 'flex', gap: '10px' },
    searchBtn: {
        backgroundColor: '#2b6cb0',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 14px',
        cursor: 'pointer',
    },
    formCard: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '20px',
    },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #cbd5e0',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        minHeight: '70px',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #cbd5e0',
        boxSizing: 'border-box',
        marginBottom: '12px',
    },
    submitBtn: {
        backgroundColor: '#38a169',
        color: '#fff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#ebf8ff' },
    th: { padding: '12px', textAlign: 'left', color: '#2b6cb0', fontWeight: 'bold', fontSize: '13px' },
    tableRow: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', fontSize: '13px', color: '#4a5568' },
    noData: { padding: '20px', textAlign: 'center', color: '#718096' },
    error: { color: '#c53030', marginBottom: '12px' },
    active: { backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    completed: { backgroundColor: '#c6f6d5', color: '#276749', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    stopped: { backgroundColor: '#fed7d7', color: '#9b2c2c', padding: '3px 8px', borderRadius: '12px', fontSize: '12px' },
    stopBtn: {
        backgroundColor: '#c53030',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        marginRight: '6px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    completeBtn: {
        backgroundColor: '#2f855a',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
        fontSize: '12px',
    },
    readOnly: { color: '#718096', fontSize: '12px' },
};

export default Prescriptions;
