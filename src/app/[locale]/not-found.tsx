import Link from "next/link";

export default function NotFound() {
  return (
    <div className="readable">
      <h1>No encontramos esta página</h1>
      <p>Puede que la guía todavía esté en preparación o que el enlace haya cambiado.</p>
      <div className="btn-row">
        <Link className="btn" href="/es/asistente">
          ¿Qué trámite necesito?
        </Link>
        <Link className="btn btn-secondary" href="/es/buscar">
          Buscar
        </Link>
      </div>
    </div>
  );
}
