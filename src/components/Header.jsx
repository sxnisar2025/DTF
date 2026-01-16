export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold">
          MyApp
        </div>

        {/* Menu */}
        <nav className="flex gap-6 text-sm font-medium">
          <a href="/dashboard" className="hover:text-black text-gray-600">
            Dashboard
          </a>
          <a href="/" className="hover:text-black text-gray-600">
            Logout
          </a>
        </nav>
      </div>
    </header>
  );
}
