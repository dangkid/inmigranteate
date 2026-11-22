export interface Opcion {
  id: string;
  etiqueta: string;
  /** id del nodo al que lleva esta respuesta */
  siguiente: string;
}

export interface NodoPregunta {
  tipo: "pregunta";
  id: string;
  texto: string;
  ayuda?: string;
  opciones: Opcion[];
}

export interface EnlaceExterno {
  titulo: string;
  url: string;
}

export interface NodoResultado {
  tipo: "resultado";
  id: string;
  titulo: string;
  /** Explicación breve en lenguaje sencillo (admite **negrita** y enlaces markdown). */
  explicacion: string;
  /** Slugs de fichas existentes en content/tramites */
  tramites: string[];
  /** Trámites aún sin ficha: se muestran como "guía en preparación". */
  proximamente?: string[];
  enlaces?: EnlaceExterno[];
  /** Destacar que conviene ayuda profesional/ONG */
  recomendarAyuda?: boolean;
}

export type Nodo = NodoPregunta | NodoResultado;

export interface Arbol {
  inicio: string;
  nodos: Record<string, Nodo>;
}
