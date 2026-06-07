export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-primary p-4">
      <div className="container-content text-center">
        <h1 className="text-4xl font-display mb-4 text-text-primary">
          Manas Prakriti & Anxiety Assessment Platform
        </h1>
        <p className="text-lg text-text-secondary mb-8">
          Research-grade clinical assessment tool
        </p>
        <a
          href="/login"
          className="inline-block px-8 py-3 bg-primary-500 text-white rounded-lg font-ui hover:bg-primary-600 transition"
        >
          Practitioner Login
        </a>
      </div>
    </main>
  )
}
