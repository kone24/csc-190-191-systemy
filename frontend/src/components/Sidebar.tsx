'use client';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import Avatar from '@/components/Avatar';

interface SidebarProps {
    activePage: 'dashboard' | 'analytics' | 'projects' | 'gantt' | 'clients' | 'vendors' | 'invoices' | 'account' | 'settings' | 'management' | 'recommendations';
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
            <div style={{ width: 24, height: 24, position: 'relative' }}>
                <img style={{ width: 24, height: 24, left: 0, top: 0, position: 'absolute' }} src={icon} alt={label} />
            </div>
            <div style={{
                opacity: isActive ? 1 : 0.75,
                color: 'black',
                fontSize: 20,
                fontFamily: 'Poppins',
                fontWeight: '700',
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
    const { user, isAdmin } = useUser();

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 320,
            height: '100vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            zIndex: 100,
            background: 'linear-gradient(180deg, rgba(255, 172, 128, 0) 1%, rgba(255, 172, 128, 0.30) 100%), white',
            boxShadow: '0px 4px 5px black',
        }}>
            <div style={{
                padding: 10,
                paddingBottom: 48,
                boxSizing: 'border-box',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 10,
                display: 'flex',
                minHeight: '100%'
            }}>
                {/* Logo */}
                <a href="https://headword.co" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
                    <div style={{
                        alignSelf: 'stretch',
                        height: 61.10,
                        padding: 10,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: 10,
                        display: 'flex',
                        cursor: 'pointer'
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
                            fontSize: 20,
                            fontFamily: 'Poppins',
                            fontWeight: '700',
                            wordWrap: 'break-word'
                        }}>
                            Headword!
                        </div>
                    </div>
                </a>

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
                    href="/dashboard/gantt"
                    icon="/images/icons/gantt-chart.png"
                    label="Gantt Chart"
                    isActive={activePage === 'gantt'}
                />

                <NavItem
                    href="/dashboard/clients"
                    icon="/images/icons/clients.png"
                    label="Contacts"
                    isActive={activePage === 'clients'}
                />

                <NavItem
                    href="/dashboard/vendors"
                    icon="/images/icons/vendor.png"
                    label="Vendors"
                    isActive={activePage === 'vendors'}
                />

                <NavItem
                    href="/dashboard/invoices"
                    icon="/images/icons/invoices.png"
                    label="Invoices"
                    isActive={activePage === 'invoices'}
                />

                <NavItem
                    href="/dashboard/recommendations"
                    icon="/images/icons/recommendations.png"
                    label="Recommendations"
                    isActive={activePage === 'recommendations'}
                />

                {/* Admin Only - Management */}
                {isAdmin && (
                    <NavItem
                        href="/dashboard/management"
                        icon="/images/icons/management.png"
                        label="Management"
                        isActive={activePage === 'management'}
                    />
                )}

                {/* Spacer */}
                <div style={{ flex: 1 }} />


                {/* Bottom Navigation - Account Icon with Avatar */}
                <div style={{ alignSelf: 'stretch' }}>
                    <Link href="/dashboard/account" style={{ textDecoration: 'none', alignSelf: 'stretch' }}>
                        <div style={{
                            alignSelf: 'stretch',
                            height: 61.10,
                            padding: 10,
                            background: activePage === 'account'
                                ? 'linear-gradient(90deg, rgba(255, 89, 0, 0.40) 0%, rgba(255, 255, 255, 0.40) 50%, rgba(255, 89, 0, 0.40) 100%), white'
                                : 'transparent',
                            boxShadow: activePage === 'account' ? '0px 4px 4px rgba(0, 0, 0, 0.25)' : 'none',
                            borderRadius: activePage === 'account' ? 20 : undefined,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: 10,
                            display: 'flex',
                            cursor: 'pointer'
                        }}>
                            <Avatar
                                name={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '?'}
                                avatarUrl={user?.avatar}
                                size={32}
                                border="2px solid #FF5900"
                            />
                            <div style={{
                                opacity: activePage === 'account' ? 1 : 0.75,
                                color: 'black',
                                fontSize: 20,
                                fontFamily: 'Poppins',
                                fontWeight: '700',
                                wordWrap: 'break-word'
                            }}>
                                Account
                            </div>
                        </div>
                    </Link>
                </div>

                <NavItem
                    href="/dashboard/settings"
                    icon="/images/icons/settings.png"
                    label="Settings"
                    isActive={activePage === 'settings'}
                />
            </div>
        </div>
    );
}