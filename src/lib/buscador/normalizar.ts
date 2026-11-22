/** Minúsculas y sin tildes, para que "tramite" encuentre "trámite". */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export interface DocBusqueda {
  id: string;
  tipo: "tramite" | "glosario" | "pagina" | "novedad";
  titulo: string;
  resumen: string;
  texto: string;
  claves: string;
  url: string;
}
