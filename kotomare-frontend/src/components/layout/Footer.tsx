import Link from 'next/link';

export function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: 'var(--background)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span
                  className="font-bold text-lg"
                  style={{ color: 'var(--primary-foreground)' }}
                >
                  K
                </span>
              </div>
              <span
                className="font-semibold text-xl"
                style={{ color: 'var(--foreground)' }}
              >
                Kotomare
              </span>
            </div>
            <p
              className="text-sm max-w-md"
              style={{ color: 'var(--foreground-muted)' }}
            >
              Tu plataforma favorita para ver anime. Disfruta de miles de series y películas
              en múltiples fuentes y calidades.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-medium mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/browse"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Explorar
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Favoritos
                </Link>
              </li>
              <li>
                <Link
                  href="/watchlist"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Mi Lista
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="font-medium mb-4"
              style={{ color: 'var(--foreground)' }}
            >
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Términos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/dmca"
                  className="transition-colors text-sm"
                  style={{ color: 'var(--foreground-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--foreground-muted)')}
                >
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            © {new Date().getFullYear()} Kotomare. Todos los derechos reservados.
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-muted)', opacity: 0.7 }}>
            Este sitio no almacena ningún archivo en sus servidores.
          </p>
        </div>
      </div>
    </footer>
  );
}
