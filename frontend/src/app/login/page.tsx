export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#0b0b0b]">
      {/* Page container / header */}
      <header className="w-full max-w-3xl mx-auto mb-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">HEADWORD</h1>
        </div>
      </header>

      {/* Form card */}
      <main className="w-full max-w-md mx-auto">
        <div className="bg-white/70 dark:bg-black/40 rounded-lg p-8 shadow">
          <h2 className="text-2xl font-semibold mb-4">Sign in</h2>

          <form method="post" className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span className="text-sm font-medium">Email</span>
              <input
                name="email"
                type="email"
                required
                className="mt-1 p-2 border rounded"
                aria-label="Email"
              />
            </label>

            <label className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Password</span>
              </div>
              <input
                name="password"
                type="password"
                required
                className="mt-1 p-2 border rounded"
                aria-label="Password"
              />
            </label>

            <button
              type="submit"
              className="mt-2 px-4 py-2 rounded bg-black text-white"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* Footer links under the card */}
        <footer className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          <a className="text-sm text-blue-600 hover:underline" href="#">Forgot password?</a>
        </footer>
      </main>
    </div>
  );
}
