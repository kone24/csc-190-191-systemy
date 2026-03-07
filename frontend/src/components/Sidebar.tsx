'use client';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

interface SidebarProps {
    activePage: 'dashboard' | 'analytics' | 'projects' | 'clients' | 'vendors' | 'invoices' | 'account' | 'settings' | 'management';
}

interface NavItemProps {
    href: string;
    icon: string;
    label: string;
    isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
    const content = (
        <div style={{
            alignSelf: 'stretch',
            height: 61.10,
            padding: 10,
            background: isActive
                ? 'linear-gradient(90deg, rgba(255, 89, 0, 0.40) 0%, rgba(255, 255, 255, 0.40) 50%, rgba(255, 89, 0, 0.40) 100%), white'
                : 'transparent',
            boxShadow: isActive ? '0px 4px 4px rgba(0, 0, 0, 0.25)' : 'none',
            borderRadius: isActive ? 20 : undefined,
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 10,
            display: 'flex',
            cursor: 'pointer'
        }}>
            <div style={{ width: 20, height: 20, position: 'relative' }}>
                <img style={{ width: 20, height: 20, left: 0, top: 0, position: 'absolute' }} src={icon} alt={label} />
            </div>
            <div style={{
                opacity: isActive ? 1 : 0.75,
                color: 'black',
                fontSize: 18,
                fontFamily: 'Poppins',
                fontWeight: '500',
                wordWrap: 'break-word'
            }}>
                {label}
            </div>
        </div>
    );

    return href ? (
        <Link href={href} style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
            {content}
        </Link>
    ) : content;
};

export default function Sidebar({ activePage }: SidebarProps) {
    const { isAdmin } = useUser();
    
    return (
        <div style={{
            width: 320,
            minHeight: '100vh',
            background: 'linear-gradient(180deg, rgba(255, 172, 128, 0) 1%, rgba(255, 172, 128, 0.30) 100%), white',
            boxShadow: '0px 4px 5px black',
            flexShrink: 0
        }}>
            <div style={{
                padding: 10,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 10,
                display: 'flex',
                height: '100%'
            }}>
                {/* Logo */}
                <div style={{
                    alignSelf: 'stretch',
                    height: 61.10,
                    padding: 10,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 10,
                    display: 'flex'
                }}>
                    <div style={{ width: 20, height: 20, position: 'relative' }}>
                        <img style={{
                            width: 19.73,
                            height: 19.73,
                            left: 0,
                            top: 0.28,
                            position: 'absolute',
                            transform: 'rotate(-1deg)',
                            transformOrigin: 'top left'
                        }} src="/images/logos/headword.png" alt="Logo" />
                    </div>
                    <div style={{
                        opacity: 0.75,
                        color: 'black',
                        fontSize: 18,
                        fontFamily: 'Poppins',
                        fontWeight: '500',
                        wordWrap: 'break-word'
                    }}>
                        Headword!
                    </div>
                </div>

                {/* Navigation Items */}
                <NavItem
                    href="/dashboard"
                    icon="/images/icons/dashboard.png"
                    label="Dashboard"
                    isActive={activePage === 'dashboard'}
                />

                <NavItem
                    href="/dashboard/analytics"
                    icon="/images/icons/analytics.png"
                    label="Analytics"
                    isActive={activePage === 'analytics'}
                />

                <NavItem
                    href="/dashboard/projects"
                    icon='/images/icons/projects.png'
                    label="Projects"
                    isActive={activePage === 'projects'}
                />

                <NavItem
                    href="/dashboard/clients"
                    icon="/images/icons/clients.png"
                    label="Contacts"
                    isActive={activePage === 'clients'}
                />

                <NavItem
                    href="/dashboard/vendors"
                    icon="/images/icons/vendors.png"
                    label="Vendors"
                    isActive={activePage === 'vendors'}
                />

                <NavItem
                    href="/dashboard/invoices"
                    icon="/images/icons/invoices.png"
                    label="Invoices"
                    isActive={activePage === 'invoices'}
                />

                {/* Admin Only - Management */}
                {isAdmin && (
                    <NavItem
                        href="/dashboard/management"
                        icon="/images/icons/settings.png"
                        label="Management"
                        isActive={activePage === 'management'}
                    />
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom Navigation */}
                <NavItem
                    href="/dashboard/account"
                    icon="/images/images/account.png"
                    label="Account"
                    isActive={activePage === 'account'}
                />

                <NavItem
                    href=""
                    icon="/images/icons/settings.png"
                    label="Settings"
                    isActive={activePage === 'settings'}
                />
            </div>
        </div>
    );
}