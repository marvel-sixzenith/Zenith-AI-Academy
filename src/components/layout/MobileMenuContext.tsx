'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface MobileMenuContextType {
    isMobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    openMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleMobileMenu: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

interface MobileMenuProviderProps {
    children: ReactNode;
}

export function MobileMenuProvider({ children }: MobileMenuProviderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const setMobileMenuOpen = useCallback((open: boolean) => {
        setIsMobileMenuOpen(open);
    }, []);

    const openMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(true);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen(prev => !prev);
    }, []);

    return (
        <MobileMenuContext.Provider
            value={{
                isMobileMenuOpen,
                setMobileMenuOpen,
                openMobileMenu,
                closeMobileMenu,
                toggleMobileMenu
            }}
        >
            {children}
        </MobileMenuContext.Provider>
    );
}

export function useMobileMenu() {
    const context = useContext(MobileMenuContext);
    if (context === undefined) {
        throw new Error('useMobileMenu must be used within a MobileMenuProvider');
    }
    return context;
}
