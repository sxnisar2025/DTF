export default function Footer() {
  return (
    <footer className="bg-light border-top mt-auto">
      <div className="container text-center py-3 text-muted small">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </div>
    </footer>
  );
}
