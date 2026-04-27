import React from 'react';
import { render, screen } from '@testing-library/react';
import { RoleGuard, AdminOnly, ManagerAndAbove } from './RoleGuard';

// ---------------------------------------------------------------------------
// Mock UserContext
// ---------------------------------------------------------------------------

let mockUser: any = null;
let mockIsAuthenticated = false;

jest.mock('@/contexts/UserContext', () => ({
    useUser: () => ({
        user: mockUser,
        isAuthenticated: mockIsAuthenticated,
        isAdmin: mockUser?.role === 'Administrator',
        isManager: mockUser?.role === 'Manager' || mockUser?.role === 'Administrator',
    }),
}));

// Mock next/navigation router
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setUser(role: 'Administrator' | 'Manager' | 'User') {
    mockUser = { id: 'u1', role, firstName: 'Test', lastName: 'User', email: 'test@example.com', company: 'Co', phone: '123' };
    mockIsAuthenticated = true;
}

function clearUser() {
    mockUser = null;
    mockIsAuthenticated = false;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RoleGuard', () => {
    beforeEach(() => {
        clearUser();
    });

    // =========================================================================
    // Renders children when allowed
    // =========================================================================

    it('renders children when user has allowed role', () => {
        setUser('Administrator');
        render(
            <RoleGuard allowedRoles={['Administrator']}>
                <div>Protected Content</div>
            </RoleGuard>,
        );
        expect(screen.getByText('Protected Content')).toBeTruthy();
    });

    it('renders children for Manager when Manager is in allowedRoles', () => {
        setUser('Manager');
        render(
            <RoleGuard allowedRoles={['Administrator', 'Manager']}>
                <div>Manager Content</div>
            </RoleGuard>,
        );
        expect(screen.getByText('Manager Content')).toBeTruthy();
    });

    // =========================================================================
    // Not authenticated
    // =========================================================================

    it('renders "Please log in" when not authenticated and no fallback', () => {
        clearUser();
        render(
            <RoleGuard allowedRoles={['Administrator']}>
                <div>Secret</div>
            </RoleGuard>,
        );
        expect(screen.getByText(/Please log in/i)).toBeTruthy();
        expect(screen.queryByText('Secret')).toBeNull();
    });

    it('renders fallback when not authenticated and fallback is provided', () => {
        clearUser();
        render(
            <RoleGuard allowedRoles={['Administrator']} fallback={<div>Custom Fallback</div>}>
                <div>Secret</div>
            </RoleGuard>,
        );
        expect(screen.getByText('Custom Fallback')).toBeTruthy();
        expect(screen.queryByText('Secret')).toBeNull();
    });

    // =========================================================================
    // Access denied
    // =========================================================================

    it('renders "Access Denied" when role is not in allowedRoles', () => {
        setUser('User');
        render(
            <RoleGuard allowedRoles={['Administrator']}>
                <div>Admin Only</div>
            </RoleGuard>,
        );
        expect(screen.getByText(/Access Denied/i)).toBeTruthy();
        expect(screen.queryByText('Admin Only')).toBeNull();
    });

    it('renders fallback instead of "Access Denied" when fallback is provided', () => {
        setUser('User');
        render(
            <RoleGuard allowedRoles={['Administrator']} fallback={<div>No Access Fallback</div>}>
                <div>Admin Only</div>
            </RoleGuard>,
        );
        expect(screen.getByText('No Access Fallback')).toBeTruthy();
    });

    // =========================================================================
    // AdminOnly convenience wrapper
    // =========================================================================

    describe('AdminOnly', () => {
        it('renders children for Administrator', () => {
            setUser('Administrator');
            render(<AdminOnly><div>Admin Content</div></AdminOnly>);
            expect(screen.getByText('Admin Content')).toBeTruthy();
        });

        it('renders "Access Denied" for Manager', () => {
            setUser('Manager');
            render(<AdminOnly><div>Admin Only</div></AdminOnly>);
            expect(screen.getByText(/Access Denied/i)).toBeTruthy();
        });

        it('renders "Access Denied" for regular User', () => {
            setUser('User');
            render(<AdminOnly><div>Admin Only</div></AdminOnly>);
            expect(screen.getByText(/Access Denied/i)).toBeTruthy();
        });
    });

    // =========================================================================
    // ManagerAndAbove convenience wrapper
    // =========================================================================

    describe('ManagerAndAbove', () => {
        it('renders children for Administrator', () => {
            setUser('Administrator');
            render(<ManagerAndAbove><div>Manager+ Content</div></ManagerAndAbove>);
            expect(screen.getByText('Manager+ Content')).toBeTruthy();
        });

        it('renders children for Manager', () => {
            setUser('Manager');
            render(<ManagerAndAbove><div>Manager+ Content</div></ManagerAndAbove>);
            expect(screen.getByText('Manager+ Content')).toBeTruthy();
        });

        it('renders "Access Denied" for regular User', () => {
            setUser('User');
            render(<ManagerAndAbove><div>Manager+ Content</div></ManagerAndAbove>);
            expect(screen.getByText(/Access Denied/i)).toBeTruthy();
        });
    });
});
