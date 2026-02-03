'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SearchBar } from '../ui/SearchBar';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownSeparator } from '../ui/Dropdown';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavbarProps {
  user?: {
    username: string;
    avatar?: string;
  } | null;
  onSearch?: (query: string) => void;
  onLogout?: () => void;
}

export function Navbar({ user, onSearch, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    } else {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--background) 90%, transparent)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="font-bold text-lg" style={{ color: 'var(--primary-foreground)' }}>K</span>
            </div>
            <span className="font-semibold text-xl hidden sm:block" style={{ color: 'var(--foreground)' }}>
              Kotomare
            </span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Nav links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/browse"
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Explorar
              </Link>
              <Link
                href="/favorites"
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Favoritos
              </Link>
              <Link
                href="/watchlist"
                className="hover:opacity-80 transition-opacity"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Mi Lista
              </Link>
            </div>

            {/* User menu */}
            {user ? (
              <Dropdown
                align="right"
                trigger={
                  <button className="flex items-center gap-2">
                    <Avatar src={user.avatar} fallback={user.username} size="sm" />
                  </button>
                }
              >
                <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user.username}</p>
                </div>
                <DropdownItem onClick={() => window.location.href = '/profile'}>
                  Mi Perfil
                </DropdownItem>
                <DropdownItem onClick={() => window.location.href = '/settings'}>
                  Configuración
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem danger onClick={onLogout}>
                  Cerrar Sesión
                </DropdownItem>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--foreground-secondary)' }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:brightness-110 transition-all"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:opacity-80"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="mb-4">
              <SearchBar onSearch={handleSearch} />
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/browse"
                className="px-4 py-2 rounded-lg hover:opacity-80"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Explorar
              </Link>
              <Link
                href="/favorites"
                className="px-4 py-2 rounded-lg hover:opacity-80"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Favoritos
              </Link>
              <Link
                href="/watchlist"
                className="px-4 py-2 rounded-lg hover:opacity-80"
                style={{ color: 'var(--foreground-secondary)' }}
              >
                Mi Lista
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
