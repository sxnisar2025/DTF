import Header from "../components/Header";
import Footer from "../components/Footer";

export default function SocialData() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-1 p-6">
        <div className="bg-white p-8 rounded-xl shadow">

          <h1 className="text-2xl font-bold mb-4">
            Social Data
          </h1>

          <p className="text-gray-600">
            Manage your social platform data here.
          </p>

          {/* Example placeholders */}
          <ul className="mt-4 space-y-2">
            <li>📊 Facebook Stats</li>
            <li>📈 Instagram Engagement</li>
            <li>🐦 Twitter Analytics</li>
          </ul>

        </div>
      </main>

      <Footer />
    </div>
  );
}
