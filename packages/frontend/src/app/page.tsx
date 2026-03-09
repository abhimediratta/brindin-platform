export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px' }}>
      <h1>Brindin Platform</h1>
      <p>
        Creative production platform for Indian digital advertising agencies.
      </p>
      <p style={{ color: '#666', marginTop: 16 }}>
        Backend API running at{' '}
        <a href="http://localhost:3001/api/health">localhost:3001</a>
      </p>
    </main>
  );
}
