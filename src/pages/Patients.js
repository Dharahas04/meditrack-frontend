import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

function Patients({ onNavigate }) {
    const { user } = useAuth();

    const isDoctor = user?.role === 'DOCTOR';
    const canRegisterPatient = user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST';
    const canProcessRequests = canRegisterPatient;

    const [patients, setPatients] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(true);

    const [showAddForm, setShowAddForm] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);

    const [patientForm, setPatientForm] = useState({
        name: '',
        age: '',
        gender: 'MALE',
        phone: '',
        email: '',
        bloodGroup: '',
        conditionSummary: '',
        admissionDate: '',
    });

    const [requestForm, setRequestForm] = useState({
        patientName: '',
        age: '',
        gender: 'MALE',
        phone: '',
        email: '',
        bloodGroup: '',
        conditionSummary: '',
    });


    const fetchPatients = useCallback(() => {
        setLoadingPatients(true);

        const endpoint = isDoctor && user?.id
            ? `/patients/doctor/${user.id}`
            : '/patients';

        API.get(endpoint)
            .then((res) => setPatients(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoadingPatients(false));
    }, [isDoctor, user?.id]);

    const fetchPendingRequests = useCallback(() => {
        setLoadingRequests(true);
        API.get('/patient-requests?status=PENDING')
            .then((res) => setRequests(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoadingRequests(false));
    }, []);

    const fetchDoctorRequests = useCallback((doctorId) => {
        setLoadingRequests(true);
        API.get(`/patient-requests?doctorId=${doctorId}`)
            .then((res) => setRequests(res.data))
            .catch((err) => console.log(err))
            .finally(() => setLoadingRequests(false));
    }, []);

    useEffect(() => {
        fetchPatients();

        if (isDoctor && user?.id) {
            fetchDoctorRequests(user.id);
        } else if (canProcessRequests) {
            fetchPendingRequests();
        } else {
            setRequests([]);
            setLoadingRequests(false);
        }
    }, [fetchPatients, fetchDoctorRequests, fetchPendingRequests, isDoctor, canProcessRequests, user?.id]);


    const handlePatientFormChange = (e) => {
        setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
    };

    const handleRequestFormChange = (e) => {
        setRequestForm({ ...requestForm, [e.target.name]: e.target.value });
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            await API.post('/patients', patientForm);
            setShowAddForm(false);
            setPatientForm({
                name: '',
                age: '',
                gender: 'MALE',
                phone: '',
                email: '',
                bloodGroup: '',
                conditionSummary: '',
                admissionDate: '',
            });
            fetchPatients();
        } catch (err) {
            console.log(err);
        }
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        try {
            await API.post('/patient-requests', {
                ...requestForm,
                requestedByDoctorId: user?.id,
                age: requestForm.age ? Number(requestForm.age) : null,
            });
            setShowRequestForm(false);
            setRequestForm({
                patientName: '',
                age: '',
                gender: 'MALE',
                phone: '',
                email: '',
                bloodGroup: '',
                conditionSummary: '',
            });
            if (user?.id) fetchDoctorRequests(user.id);
        } catch (err) {
            console.log(err);
        }
    };

    const handleApprove = async (id) => {
        const remarks = window.prompt('Approval remarks (optional):') || '';
        try {
            await API.put(`/patient-requests/${id}/approve`, {
                processedByUserId: user?.id,
                remarks,
            });

            fetchPendingRequests();
            fetchPatients();   // 🔥 ADD THIS LINE

        } catch (err) {
            console.log(err);
        }
    };

    const handleReject = async (id) => {
        const remarks = window.prompt('Rejection reason:') || '';
        if (!remarks.trim()) return;
        try {
            await API.put(`/patient-requests/${id}/reject`, {
                processedByUserId: user?.id,
                remarks,
            });
            fetchPendingRequests();
        } catch (err) {
            console.log(err);
        }
    };

    const handleMarkRegistered = async (id) => {
        try {
            await API.put(`/patient-requests/${id}/registered?processedByUserId=${user?.id}`);
            fetchPendingRequests();
            fetchPatients();   // 🔥 ADD THIS
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

                <div style={styles.headerActions}>
                    {canRegisterPatient && (
                        <button style={styles.addBtn} onClick={() => setShowAddForm(!showAddForm)}>
                            {showAddForm ? 'Cancel' : '+ Add Patient'}
                        </button>
                    )}

                    {isDoctor && (
                        <button style={styles.requestBtn} onClick={() => setShowRequestForm(!showRequestForm)}>
                            {showRequestForm ? 'Cancel' : '+ Request Add Patient'}
                        </button>
                    )}
                </div>
            </div>

            {canRegisterPatient && showAddForm && (
                <div style={styles.formCard}>
                    <h3>Register New Patient</h3>
                    <form onSubmit={handleAddPatient}>
                        <div style={styles.formGrid}>
                            <input style={styles.input} name="name" placeholder="Name" value={patientForm.name} onChange={handlePatientFormChange} required />
                            <input style={styles.input} type="number" name="age" placeholder="Age" value={patientForm.age} onChange={handlePatientFormChange} required />
                            <select style={styles.input} name="gender" value={patientForm.gender} onChange={handlePatientFormChange}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <input style={styles.input} name="phone" placeholder="Phone" value={patientForm.phone} onChange={handlePatientFormChange} />
                            <input style={styles.input} name="email" placeholder="Email" value={patientForm.email} onChange={handlePatientFormChange} />
                            <input style={styles.input} name="bloodGroup" placeholder="Blood Group" value={patientForm.bloodGroup} onChange={handlePatientFormChange} />
                            <input style={styles.input} type="date" name="admissionDate" value={patientForm.admissionDate} onChange={handlePatientFormChange} />
                        </div>
                        <textarea
                            style={styles.textarea}
                            name="conditionSummary"
                            placeholder="Condition summary"
                            value={patientForm.conditionSummary}
                            onChange={handlePatientFormChange}
                        />
                        <button style={styles.submitBtn} type="submit">Save Patient</button>
                    </form>
                </div>
            )}

            {isDoctor && showRequestForm && (
                <div style={styles.formCard}>
                    <h3>Request Patient Registration (to Reception/Admin)</h3>
                    <form onSubmit={handleCreateRequest}>
                        <div style={styles.formGrid}>
                            <input style={styles.input} name="patientName" placeholder="Patient Name" value={requestForm.patientName} onChange={handleRequestFormChange} required />
                            <input style={styles.input} type="number" name="age" placeholder="Age" value={requestForm.age} onChange={handleRequestFormChange} />
                            <select style={styles.input} name="gender" value={requestForm.gender} onChange={handleRequestFormChange}>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <input style={styles.input} name="phone" placeholder="Phone" value={requestForm.phone} onChange={handleRequestFormChange} />
                            <input style={styles.input} name="email" placeholder="Email" value={requestForm.email} onChange={handleRequestFormChange} />
                            <input style={styles.input} name="bloodGroup" placeholder="Blood Group" value={requestForm.bloodGroup} onChange={handleRequestFormChange} />
                        </div>
                        <textarea
                            style={styles.textarea}
                            name="conditionSummary"
                            placeholder="Condition summary"
                            value={requestForm.conditionSummary}
                            onChange={handleRequestFormChange}
                        />
                        <button style={styles.submitBtn} type="submit">Submit Request</button>
                    </form>
                </div>
            )}

            <div style={styles.tableCard}>
                <h3 style={styles.sectionTitle}>Patients List</h3>
                {loadingPatients ? (
                    <p style={styles.loading}>Loading patients...</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Name</th>
                                <th style={styles.th}>Age</th>
                                <th style={styles.th}>Gender</th>
                                <th style={styles.th}>Condition</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.length === 0 ? (
                                <tr><td colSpan="7" style={styles.noData}>No patients found</td></tr>
                            ) : (
                                patients.map((p) => (
                                    <tr key={p.id} style={styles.tableRow}>
                                        <td style={styles.td}>{p.id}</td>
                                        <td style={styles.td}>{p.name}</td>
                                        <td style={styles.td}>{p.age}</td>
                                        <td style={styles.td}>{p.gender}</td>
                                        <td style={styles.td}>{p.conditionSummary}</td>
                                        <td style={styles.td}>{p.status}</td>
                                        <td style={styles.td}>
                                            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && p.status === 'ADMITTED' && (
                                                <button style={styles.dischargeBtn} onClick={() => handleDischarge(p.id)}>
                                                    Discharge
                                                </button>
                                            )}
                                            {user?.role === 'DOCTOR' && (
                                                <button
                                                    style={styles.secondaryBtn}
                                                    onClick={() => onNavigate?.('prescriptions', { patientId: p.id, patientName: p.name })}
                                                >
                                                    Prescribe
                                                </button>


                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div style={styles.tableCard}>
                <h3 style={styles.sectionTitle}>
                    {canProcessRequests ? 'Pending Patient Requests' : 'My Patient Requests'}
                </h3>
                {loadingRequests ? (
                    <p style={styles.loading}>Loading requests...</p>
                ) : (
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.tableHeader}>
                                <th style={styles.th}>Patient</th>
                                <th style={styles.th}>Requested By</th>
                                <th style={styles.th}>Condition</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Remarks</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr><td colSpan="6" style={styles.noData}>No requests found</td></tr>
                            ) : (
                                requests.map((r) => (
                                    <tr key={r.id} style={styles.tableRow}>
                                        <td style={styles.td}>{r.patientName}</td>
                                        <td style={styles.td}>{r.requestedByDoctor?.name}</td>
                                        <td style={styles.td}>{r.conditionSummary}</td>
                                        <td style={styles.td}>{r.status}</td>
                                        <td style={styles.td}>{r.remarks || '-'}</td>
                                        <td style={styles.td}>
                                            {canProcessRequests && r.status === 'PENDING' && (
                                                <>
                                                    <button style={styles.approveBtn} onClick={() => handleApprove(r.id)}>Approve</button>
                                                    <button style={styles.rejectBtn} onClick={() => handleReject(r.id)}>Reject</button>
                                                </>
                                            )}
                                            {canProcessRequests && r.status === 'APPROVED' && (
                                                <button style={styles.secondaryBtn} onClick={() => handleMarkRegistered(r.id)}>
                                                    Mark Registered
                                                </button>
                                            )}
                                            {!canProcessRequests && <span style={styles.readOnly}>View Only</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    heading: { color: '#2b6cb0' },
    headerActions: { display: 'flex', gap: '10px' },
    addBtn: { backgroundColor: '#2b6cb0', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' },
    requestBtn: { backgroundColor: '#6b46c1', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '6px', cursor: 'pointer' },
    formCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '20px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' },
    input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' },
    textarea: { width: '100%', minHeight: '70px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', marginBottom: '12px' },
    submitBtn: { backgroundColor: '#38a169', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer' },

    tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '20px' },
    sectionTitle: { margin: 0, padding: '14px 16px', borderBottom: '1px solid #edf2f7', color: '#2d3748' },
    loading: { padding: '16px' },

    table: { width: '100%', borderCollapse: 'collapse' },
    tableHeader: { backgroundColor: '#ebf8ff' },
    th: { padding: '12px', textAlign: 'left', color: '#2b6cb0', fontWeight: 'bold', fontSize: '13px' },
    tableRow: { borderBottom: '1px solid #e2e8f0' },
    td: { padding: '12px', fontSize: '13px', color: '#4a5568' },
    noData: { padding: '20px', textAlign: 'center', color: '#718096' },

    approveBtn: { backgroundColor: '#2f855a', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '6px', cursor: 'pointer' },
    rejectBtn: { backgroundColor: '#c53030', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    dischargeBtn: { backgroundColor: '#e53e3e', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' },
    secondaryBtn: { backgroundColor: '#4a5568', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
    readOnly: { color: '#718096', fontSize: '12px' },
};

export default Patients;
