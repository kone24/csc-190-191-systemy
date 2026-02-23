'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { useUser, User } from '@/contexts/UserContext';

export default function AccountPage() {
    const { user, setUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [tempProfile, setTempProfile] = useState<User | null>(user);

    useEffect(() => {
        if (user) {
            setTempProfile(user);
        }
    }, [user]);

    const handleEdit = () => {
        setTempProfile(user);
        setIsEditing(true);
    };

    const handleSave = () => {
        if (tempProfile) {
            setUser(tempProfile);
            setIsEditing(false);
            // TODO: Send update to backend
            console.log('Profile updated:', tempProfile);
        }
    };

    const handleCancel = () => {
        setTempProfile(user);
        setIsEditing(false);
    };

    const handleInputChange = (field: keyof User, value: string) => {
        if (tempProfile) {
            setTempProfile(prev => prev ? ({
                ...prev,
                [field]: value
            }) : prev);
        }
    };

    if (!user || !tempProfile) {
        return (
            <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="account" />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(217, 217, 217, 0.15)',
                padding: '20px 20px 20px 30px',
                gap: '20px'
            }}>
                {/* Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Page Title */}
                    <div style={{
                        color: 'black',
                        fontSize: 32,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        wordWrap: 'break-word'
                    }}>
                        Account Settings
                    </div>

                    {/* Menu Dots */}
                    <div style={{ justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex' }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                        <div style={{
                            width: 8,
                            height: 8,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'pointer'
                        }} />
                    </div>
                </div>

                {/* Profile Card */}
                <div style={{
                    background: 'white',
                    borderRadius: 20,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    padding: '30px',
                    maxWidth: '800px'
                }}>
                    {/* Profile Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '25px',
                        marginBottom: '30px',
                        paddingBottom: '20px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FF5900 0%, #FFAC80 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 32,
                            fontFamily: 'Poppins',
                            fontWeight: '600'
                        }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>

                        {/* Profile Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontSize: 28,
                                fontFamily: 'Poppins',
                                fontWeight: '600',
                                color: 'black',
                                marginBottom: '5px'
                            }}>
                                {user.firstName} {user.lastName}
                            </div>
                            <div style={{
                                fontSize: 16,
                                fontFamily: 'Poppins',
                                color: 'rgba(0, 0, 0, 0.6)',
                                marginBottom: '5px'
                            }}>
                                {user.email}
                            </div>
                            <div style={{
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                color: '#FF5900',
                                fontWeight: '500'
                            }}>
                                {user.role}
                            </div>
                        </div>

                        {/* Edit Button */}
                        {!isEditing ? (
                            <button
                                onClick={handleEdit}
                                style={{
                                    padding: '10px 20px',
                                    background: '#FF5900',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 10,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'background 0.3s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#E04D00'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#FF5900'}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#00F5A0',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: 16,
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#ccc',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: 10,
                                        fontSize: 16,
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Profile Form */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '20px'
                    }}>
                        {/* First Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                value={isEditing ? tempProfile.firstName : user.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                value={isEditing ? tempProfile.lastName : user.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={isEditing ? tempProfile.email : user.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={isEditing ? tempProfile.phone : user.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            />
                        </div>

                        {/* Company */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                Company
                            </label>
                            <input
                                type="text"
                                value={isEditing ? tempProfile.company : user.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            />
                        </div>

                        {/* Role */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 14,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '8px'
                            }}>
                                Role
                            </label>
                            <select
                                value={isEditing ? tempProfile.role : user.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                disabled={!isEditing}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px',
                                    border: '1px solid rgba(0, 0, 0, 0.2)',
                                    borderRadius: 8,
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                    background: isEditing ? 'white' : '#f5f5f5',
                                    color: isEditing ? 'black' : 'rgba(0, 0, 0, 0.7)'
                                }}
                            >
                                <option value="Administrator">Administrator</option>
                                <option value="Manager">Manager</option>
                                <option value="User">User</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div style={{
                    background: 'white',
                    borderRadius: 20,
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                    padding: '30px',
                    maxWidth: '800px',
                    marginTop: '20px'
                }}>
                    <h3 style={{
                        fontSize: 22,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        color: 'black',
                        marginBottom: '20px',
                        paddingBottom: '15px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                        Security Settings
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button
                            style={{
                                padding: '15px 20px',
                                background: 'white',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: 10,
                                fontSize: 16,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8f8f8'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Change Password
                        </button>

                        <button
                            style={{
                                padding: '15px 20px',
                                background: 'white',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: 10,
                                fontSize: 16,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8f8f8'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Two-Factor Authentication
                        </button>

                        <button
                            style={{
                                padding: '15px 20px',
                                background: 'white',
                                border: '1px solid rgba(0, 0, 0, 0.2)',
                                borderRadius: 10,
                                fontSize: 16,
                                fontFamily: 'Poppins',
                                fontWeight: '500',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'background 0.3s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f8f8f8'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Login History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}