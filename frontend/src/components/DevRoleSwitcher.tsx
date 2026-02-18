'use client';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';

// Development-only component for testing different user roles
export const DevRoleSwitcher: React.FC = () => {
    const { user, setUser } = useUser();
    const [isVisible, setIsVisible] = useState(false);

    // Small delay to ensure UserContext has loaded
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) {
        return (
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'yellow',
                padding: '5px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 9999
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        console.log('DevRoleSwitcher: No user found');
        return (
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '10px',
                background: 'red',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 9999
            }}>
                No User Data
            </div>
        );
    }

    // Temporarily always show for debugging - remove this later
    console.log('DevRoleSwitcher: Rendering for user:', user.role);
    
    const switchRole = (newRole: 'Administrator' | 'Manager' | 'User') => {
        if (user) {
            const updatedUser = {
                ...user,
                role: newRole,
                firstName: newRole === 'Administrator' ? 'Admin' : 
                          newRole === 'Manager' ? 'Manager' : 'John',
                lastName: newRole === 'Administrator' ? 'User' : 
                         newRole === 'Manager' ? 'Smith' : 'Doe',
                email: `${newRole.toLowerCase()}@headword.com`
            };
            setUser(updatedUser);
        }
    };
    
    // Show in development or when no NODE_ENV is set (local development)
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    // if (!isDevelopment) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '2px solid #FF5900',
            borderRadius: '10px',
            padding: '15px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            minWidth: '200px'
        }}>
            <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#FF5900',
                textAlign: 'center'
            }}>
                🧪 DEV: Test User Roles
            </div>
            
            <div style={{
                fontSize: '12px',
                marginBottom: '10px',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.7)'
            }}>
                Current: <strong>{user.role}</strong>
            </div>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <button
                    onClick={() => switchRole('Administrator')}
                    style={{
                        padding: '8px 12px',
                        background: user.role === 'Administrator' ? '#FF5900' : 'white',
                        color: user.role === 'Administrator' ? 'white' : 'black',
                        border: '1px solid #FF5900',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: user.role === 'Administrator' ? 'bold' : 'normal'
                    }}
                >
                    👑 Administrator
                </button>
                
                <button
                    onClick={() => switchRole('Manager')}
                    style={{
                        padding: '8px 12px',
                        background: user.role === 'Manager' ? '#FF5900' : 'white',
                        color: user.role === 'Manager' ? 'white' : 'black',
                        border: '1px solid #FF5900',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: user.role === 'Manager' ? 'bold' : 'normal'
                    }}
                >
                    👔 Manager
                </button>
                
                <button
                    onClick={() => switchRole('User')}
                    style={{
                        padding: '8px 12px',
                        background: user.role === 'User' ? '#FF5900' : 'white',
                        color: user.role === 'User' ? 'white' : 'black',
                        border: '1px solid #FF5900',
                        borderRadius: '5px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: user.role === 'User' ? 'bold' : 'normal'
                    }}
                >
                    👤 User
                </button>
            </div>
            
            <div style={{
                fontSize: '10px',
                marginTop: '10px',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.5)'
            }}>
                Refresh page to see changes
            </div>
        </div>
    );
};