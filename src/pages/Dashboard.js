import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Patients from './Patients';
import Beds from './Beds';
import Appointments from './Appointments';
import Alerts from './Alerts';
import Attendance from './Attendance';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activePage, setActivePage] = useState('home');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'patients': return <Patients />;
            case 'beds': return <Beds />;
            case 'appointments': return <Appointments />;
            case 'alerts': return <Alerts />;
            case 'attendance': return <Attendance />;
            default: return <Home user={user} />;
        }
    };

    return (
        <div style={styles.container}>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <h2 style={styles.logo}>🏥 MediTrack</h2>
                <p style={styles.userInfo}>{user?.name}</p>
                <p style={styles.userRole}>{user?.role}</p>

                <hr style={styles.divider} />

                <button style={activePage === 'home' ?
                    styles.activeMenu : styles.menu}
                    onClick={() => setActivePage('home')}>
                    🏠 Home
                </button>

                <button style={activePage === 'patients' ?
                    styles.activeMenu : styles.menu}
                    onClick={() => setActivePage('patients')}>
                    🧑‍⚕️ Patients
                </button>

                <button style={activePage === 'beds' ?
                    styles.activeMenu : styles.menu}
                    onClick={() => setActivePage('beds')}>
                    🛏️ Beds
                </button>

                <button style={activePage === 'appointments' ?
                    styles.activeMenu : styles.menu}
                    onClick={() => setActivePage('appointments')}>
                    📅 Appointments
                </button>

                <button style={activePage === 'attendance' ?
                    styles.activeMenu : styles.menu}
                    onClick={() => setActivePage('attendance')}>
                    📋 Attendance
                </button>

                {user?.role === 'ADMIN' && (
                    <button style={activePage === 'alerts' ?
                        styles.activeMenu : styles.menu}
                        onClick={() => setActivePage('alerts')}>
                        🔔 Alerts
                    </button>
                )}

                <button style={styles.logoutBtn}
                    onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>

            {/* Main Content */}
            <div style={styles.main}>
                {renderPage()}
            </div>
        </div>
    );
}

// Home component
function Home({ user }) {
    return (
        <div>
            <h1 style={styles.heading}>
                Welcome, {user?.name}! 👋
            </h1>
            <p style={styles.subheading}>
                Role: {user?.role}
            </p>

            <div style={styles.cardGrid}>
                <div style={styles.card}>
                    <h2>🧑‍⚕️ Patients</h2>
                    <p>Manage admitted patients</p>
                </div>
                <div style={styles.card}>
                    <h2>🛏️ Beds</h2>
                    <p>Check bed availability</p>
                </div>
                <div style={styles.card}>
                    <h2>📅 Appointments</h2>
                    <p>View and book appointments</p>
                </div>
                <div style={styles.card}>
                    <h2>📋 Attendance</h2>
                    <p>Mark and view attendance</p>
                </div>
                <div style={styles.card}>
                    <h2>🔔 Alerts</h2>
                    <p>AI generated alerts</p>
                </div>
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
        color: 'white',
    },
    userInfo: {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0',
        color: 'white',
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