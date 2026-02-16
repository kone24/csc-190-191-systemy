'use client';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';

export default function VendorsPage() {
    return (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', background: 'white' }}>
            {/* Sidebar */}
            <Sidebar activePage="vendors" />

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
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>

                    {/* Search Container */}
                    <SearchBar placeholder="Search vendors..." onSearch={(value) => console.log('Search vendors:', value)} />
                </div>

                {/* Content Area */}
                <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '30px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        background: 'linear-gradient(135deg, #FF5900, #FFAC80)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        <img
                            src="/images/icons/vendors.png"
                            alt="Vendors"
                            style={{ width: 40, height: 40, filter: 'brightness(0) invert(1)' }}
                        />
                    </div>

                    <h2 style={{
                        color: 'black',
                        fontSize: 24,
                        fontFamily: 'Poppins',
                        fontWeight: '600',
                        marginBottom: '12px'
                    }}>
                        Vendor Management
                    </h2>

                    <p style={{
                        color: '#666',
                        fontSize: 16,
                        fontFamily: 'Poppins',
                        marginBottom: '30px',
                        maxWidth: '500px',
                        lineHeight: 1.5
                    }}>
                        Manage your vendors, suppliers, and business partners. Keep track of vendor information,
                        contracts, and relationships in one organized place.
                    </p>

                    <button style={{
                        background: 'linear-gradient(90deg, #FF5900, #FFAC80)',
                        border: 'none',
                        borderRadius: '25px',
                        padding: '12px 30px',
                        color: 'white',
                        fontSize: 16,
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        cursor: 'pointer',
                        boxShadow: '0px 4px 6px rgba(255, 89, 0, 0.3)',
                        transition: 'transform 0.2s ease'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                        Add New Vendor
                    </button>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginTop: '40px',
                        width: '100%',
                        maxWidth: '600px'
                    }}>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF5900' }}>0</div>
                            <div style={{ fontSize: 14, color: '#666' }}>Total Vendors</div>
                        </div>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF5900' }}>0</div>
                            <div style={{ fontSize: 14, color: '#666' }}>Active Contracts</div>
                        </div>
                        <div style={{
                            background: '#f8f9fa',
                            padding: '20px',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FF5900' }}>$0</div>
                            <div style={{ fontSize: 14, color: '#666' }}>Total Spend</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}