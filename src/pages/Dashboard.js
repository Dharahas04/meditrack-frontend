import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Patients from './Patients';
import Beds from './Beds';
import Appointments from './Appointments';
import Alerts from './Alerts';
import Attendance from './Attendance';
import Prescriptions from './Prescriptions';

const MENU_BY_ROLE = {
    ADMIN: ['home', 'patients', 'beds', 'appointments', 'attendance', 'alerts'],
    RECEPTIONIST: ['home', 'patients', 'appointments', 'beds'],
    DOCTOR: ['home', 'patients', 'appointments', 'attendance', 'prescriptions'],
    NURSE: ['home', 'patients', 'beds', 'attendance'],
    LAB_TECHNICIAN: ['home', 'attendance'],
};

const LABELS = {
    home: '🏠 Home',
    patients: '🧑‍⚕️ Patients',
    beds: '🛏️ Beds',
    appointments: '📅 Appointments',
    attendance: '📋 Attendance',
    alerts: '🔔 Alerts',
    prescriptions: '💊 Prescriptions',
};

const DESCRIPTIONS = {
    patients: 'Patient registration / clinical workflow',
    beds: 'Bed occupancy and ward status',
    appointments: 'Appointment operations',
    attendance: 'Shift attendance tracking',
    alerts: 'Critical system alerts',
    prescriptions: 'Medication orders and prescriptions',
};

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('home');
    const [prescriptionContext, setPrescriptionContext] = useState(null);

    const role = user?.role || '';
    const visibleMenu = useMemo(() => MENU_BY_ROLE[role] || ['home'], [role]);

    useEffect(() => {
        if (!visibleMenu.includes(activePage)) {
            setActivePage('home');
        }
    }, [activePage, visibleMenu]);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'patients':
                return (
                    <Patients
                        onNavigate={(page, payload) => {
                            setActivePage(page);
                            if (page === 'prescriptions') {
                                setPrescriptionContext(payload || null);
                            }
                        }}
                    />
                );
            case 'beds':
                return <Beds />;
            case 'appointments':
                return <Appointments />;
            case 'alerts':
                return <Alerts />;
            case 'prescriptions':
                return <Prescriptions presetPatient={prescriptionContext} />;
            case 'attendance':
                return <Attendance />;
            default:
                return <Home user={user} visibleMenu={visibleMenu} onOpen={setActivePage} />;
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>🏥 MediTrack</h2>
                <p style={styles.userInfo}>{user?.name}</p>
                <p style={styles.userRole}>{user?.role}</p>

                <hr style={styles.divider} />

                {visibleMenu.map((key) => (
                    <button
                        key={key}
                        style={activePage === key ? styles.activeMenu : styles.menu}
                        onClick={() => setActivePage(key)}
                    >
                        {LABELS[key]}
                    </button>
                ))}

                <button style={styles.logoutBtn} onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>

            <div style={styles.main}>{renderPage()}</div>
        </div>
    );
}

function Home({ user, visibleMenu, onOpen }) {
    const cards = visibleMenu.filter((k) => k !== 'home');

    return (
        <div>
            <h1 style={styles.heading}>Welcome, {user?.name}!</h1>
            <p style={styles.subheading}>Role: {user?.role}</p>

            <div style={styles.cardGrid}>
                {cards.map((key) => (
                    <div key={key} style={styles.card} onClick={() => onOpen(key)}>
                        <h2>{LABELS[key]}</h2>
                        <p>{DESCRIPTIONS[key]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
    },
    sidebar: {
        width: '220px',
        backgroundColor: '#2b6cb0',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
    },
    logo: {
        fontSize: '18px',
        marginBottom: '5px',
    },
    userInfo: {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: 0,
    },
    userRole: {
        fontSize: '12px',
        color: '#bee3f8',
        margin: '2px 0',
    },
    divider: {
        borderColor: '#4299e1',
        margin: '15px 0',
    },
    menu: {
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        padding: '10px',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '6px',
        marginBottom: '5px',
        fontSize: '14px',
        width: '100%',
    },
    activeMenu: {
        backgroundColor: '#1a4a8a',
        color: 'white',
        border: 'none',
        padding: '10px',
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: '6px',
        marginBottom: '5px',
        fontSize: '14px',
        width: '100%',
    },
    logoutBtn: {
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        padding: '10px',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: 'auto',
        fontSize: '14px',
        width: '100%',
    },
    main: {
        flex: 1,
        padding: '30px',
        backgroundColor: '#f0f4f8',
        overflowY: 'auto',
    },
    heading: {
        color: '#2b6cb0',
        marginBottom: '5px',
    },
    subheading: {
        color: '#718096',
        marginBottom: '30px',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
    },
    card: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        cursor: 'pointer',
    },
};

export default Dashboard;
