import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px',
      textAlign: 'center',
      gap: '20px',
    }}>
      <h1 style={{ fontSize: '2.5rem', color: '#3E2723' }}>You're Offline</h1>
      <p style={{ color: '#5D4037', maxWidth: '400px', fontSize: '1.1rem' }}>
        Please check your internet connection and try again.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '15px 30px',
          background: '#B71C1C',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        Go to Homepage
      </Link>
    </div>
  );
}
