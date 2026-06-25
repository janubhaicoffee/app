"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'sans-serif', background: '#f8f8f8' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ color: '#B71C1C', marginBottom: '1rem', fontSize: '2rem' }}>Oops! Something went wrong.</h1>
            <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
              We encountered a critical error while trying to load this page. Don't worry, your data is safe.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => reset()} style={{ padding: '0.8rem 1.5rem', background: '#B71C1C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Try Again
              </button>
              <button onClick={() => window.location.href = '/'} style={{ padding: '0.8rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Go Home
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
