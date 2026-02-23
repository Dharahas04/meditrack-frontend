import { useState, useEffect } from 'react';
import API from '../services/api';

function Patients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: 'MALE',
        phone: '',
        bloodGroup: '',
        conditionSummary: '',
        admissionDate: '',
    });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = () => {
        API.get('/patients')
            .then(res => {
                setPatients(res.data);
                setLoading(false);
            })
            .catch(err => console.log(err));
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/patients', formData);
            setShowForm(false);
            fetchPatients();
        } catch (err) {
            console.log(err);
        }
    };

    const handleDischarge = async (id) => {
        try {
            await API.put(`/patients/${id}/discharge`);
            fetchPatients();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.heading}>🧑‍⚕️ Patients</h1>
                <button
                    style={styles.addBtn}
                    onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Add Patient'}
                </button>
            </div>

            {/* Add Patient Form */}
            {showForm && (
                <div style={styles.formCard}>
                    <h3>Add New Patient</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Name</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="name"
                                    placeholder="Patient name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Age</label>
                                <input
                                    style={styles.input}
                                    type="number"
                                    name="age"
                                    placeholder="Age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Gender</label>
                                <select
                                    style={styles.input}
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Phone</label>
                                <input
                                    style={styles.input}
                                    type="text"
                                    name="phone"
                                    placeholder="Phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Blood Group</label>
                                <select
                                    style={styles.input}
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>
                                    Admission Date
                                </label>
                                <input
                                    style={styles.input}
                                    type="date"
                                    name="admissionDate"
                                    value={formData.admissionDate}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Condition</label>
                            <textarea
                                style={styles.textarea}
                                name="conditionSummary"
                                placeholder="Patient condition summary"
                                value={formData.conditionSummary}
                                onChange={handleChange}
                            />
                        </div>
                        <button style={styles.submitBtn} type="submit">
                            Save Patient
                        </button>
                    </form>
                </div>
            )}

            {/* Patients Table */}
            {loading ? (
                <p>Loading patients...</p>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Age</th>
                                <th style={styles.th}>Gender</th>
                                <th style={styles.th}>Blood Group</th>
                                <th style={styles.th}>Condition</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={styles.noData}>
                                        No patients found
                                    </td>
                                </tr>
                            ) : (
                                patients.map((p) => (
                                    <tr key={p.id} style={styles.tableRow}>
                                        <td style={styles.td}>{p.name}</td>
                                        <td style={styles.td}>{p.age}</td>
                                        <td style={styles.td}>{p.gender}</td>
                                        <td style={styles.td}>{p.bloodGroup}</td>
                                        <td style={styles.td}>
                                            {p.conditionSummary}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={
                                                p.status === 'ADMITTED'
                                                    ? styles.admitted
                                                    : p.status === 'CRITICAL'
                                                        ? styles.critical
                                                        : styles.discharged
                                            }>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            {p.status === 'ADMITTED' && (
                                                <button
                                                    style={styles.dischargeBtn}
                                                    onClick={() =>
                                                        handleDischarge(p.id)
                                                    }>
                                                    Discharge
                                                </button>
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
    tableCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
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
    admitted: {
        backgroundColor: '#c6f6d5',
        color: '#276749',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    critical: {
        backgroundColor: '#fed7d7',
        color: '#9b2c2c',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    discharged: {
        backgroundColor: '#e2e8f0',
        color: '#4a5568',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
    },
    dischargeBtn: {
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
    },
};

export default Patients;