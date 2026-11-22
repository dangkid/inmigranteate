/** Textos de interfaz en español (idioma de referencia). */
const es = {
  meta: {
    tagline: "Trámites de extranjería en España, explicados paso a paso",
    description:
      "Guías gratuitas y en lenguaje sencillo para hacer tú mismo los trámites de extranjería en España: arraigos, NIE, TIE, nacionalidad y más. Con fuentes oficiales.",
  },
  nav: {
    skip: "Saltar al contenido",
    home: "Inicio",
    tramites: "Trámites",
    asistente: "¿Qué trámite necesito?",
    calculadoras: "Calculadoras",
    glosario: "Glosario",
    ayuda: "Ayuda gratuita",
    estafas: "Estafas",
    novedades: "Novedades",
    buscar: "Buscar",
    reportar: "Reportar un error",
    sobre: "Cómo trabajamos",
    privacidad: "Privacidad",
    avisoLegal: "Aviso legal",
    menu: "Menú",
    idioma: "Idioma",
    proximamente: "próximamente",
  },
  common: {
    ultimaVerificacion: "Última verificación",
    fuenteOficial: "Fuente oficial",
    leerMas: "Leer más",
    verTramite: "Ver guía",
    enPreparacion: "Guía en preparación",
    volver: "Volver",
    imprimir: "Imprimir",
    descargar: "Descargar lista (.txt)",
    reiniciar: "Empezar de nuevo",
    atras: "Atrás",
    pendiente: "Pendiente de verificar",
    nivel: "Nivel",
    consultada: "consultada el",
  },
  disclaimer: {
    titulo: "Información orientativa, no es asesoramiento legal.",
    texto:
      "Cada caso es distinto y las normas cambian. Antes de presentar nada, comprueba la fuente oficial. Si tu caso es complicado, pide ayuda gratuita a una ONG o al turno de oficio.",
  },
  home: {
    titulo: "Haz tus trámites de extranjería sin pagar por lo que puedes hacer tú",
    intro:
      "Explicamos los trámites de extranjería en España paso a paso, en lenguaje claro y con enlaces a la fuente oficial de cada dato. Gratis, sin registro y sin guardar tus datos.",
    ctaAsistente: "Descubre qué trámite necesitas",
    ctaTramites: "Ver todos los trámites",
    buscarPlaceholder: "Busca: arraigo, TIE, apostilla…",
    categorias: "Trámites por tema",
    novedades: "Últimos cambios en la normativa",
    herramientas: "Herramientas",
  },
  tramite: {
    paraQuien: "¿Para quién es?",
    paraQuienNo: "No es para ti si…",
    requisitos: "Requisitos",
    documentos: "Documentos",
    pasos: "Paso a paso",
    tasas: "Tasas",
    plazos: "Plazos",
    tiemposReales: "Tiempos reales",
    tiemposRealesAviso:
      "Experiencia de usuarios: lo que cuentan personas que han hecho el trámite. No es un dato oficial y cambia mucho según la provincia.",
    tiemposRealesVacio: "Todavía no hemos recopilado experiencias contrastadas para este trámite.",
    errores: "Errores frecuentes",
    denegacion: "Motivos de denegación habituales",
    siDeniegan: "Qué hacer si te lo deniegan",
    ayudaProfesional: "Cuándo pedir ayuda profesional",
    normativa: "Normativa",
    fuentes: "Fuentes",
    faq: "Preguntas frecuentes",
    checklist: "Tu lista de comprobación",
    checklistAyuda:
      "Marca lo que ya tienes. Se guarda solo en este navegador; no se envía a ningún sitio.",
    borrador:
      "Guía en revisión: algunos datos están marcados como «pendiente de verificar». No te bases solo en ellos.",
    traduccionPendiente: "Esta guía aún no está traducida a tu idioma; se muestra en español.",
    relacionados: "Trámites relacionados",
    reportar: "¿Ves algo desactualizado o incorrecto? Avísanos",
    revisionVencida:
      "Esta guía no se ha revisado en los últimos 90 días. Comprueba con especial cuidado la fuente oficial.",
    legalizacion: {
      no: "No necesita apostilla ni legalización",
      apostilla_o_legalizacion: "Necesita apostilla o legalización",
      segun_pais: "Apostilla o legalización según el país",
    },
    traduccionJurada: "Traducción jurada si no está en castellano",
    modo: {
      online: "Online",
      presencial: "Presencial",
      online_o_presencial: "Online o presencial",
    },
  },
  categorias: {
    "documentacion": "Documentación básica",
    "estancias-visados": "Visados y estancias",
    "arraigos-regularizacion": "Arraigos y regularización",
    "familia": "Familia",
    "trabajo-residencia": "Trabajo y renovaciones",
    "proteccion-internacional": "Protección internacional",
    "nacionalidad": "Nacionalidad",
    "vida-practica": "Vida práctica",
  },
  asistente: {
    titulo: "¿Qué trámite necesito?",
    intro:
      "Responde unas preguntas sencillas y te orientamos hacia el trámite que encaja con tu situación. No guardamos tus respuestas.",
    paso: "Pregunta",
    resultado: "Nuestra orientación",
    tramitesRecomendados: "Guías recomendadas",
    enlacesOficiales: "Enlaces oficiales",
    avisoResultado:
      "Esto es una orientación general a partir de tus respuestas. Revisa los requisitos de la guía y, si tienes dudas, consulta gratis con una ONG.",
  },
  buscar: {
    titulo: "Buscar",
    placeholder: "¿Qué buscas?",
    sinResultados: "No hay resultados. Prueba con otra palabra o usa el asistente.",
    resultados: "resultados",
    tipos: { tramite: "Trámite", glosario: "Glosario", pagina: "Página", novedad: "Novedad" },
  },
  glosario: {
    titulo: "Glosario",
    intro: "Palabras de extranjería explicadas en lenguaje sencillo.",
    verTambien: "Ver también",
  },
  calc: {
    titulo: "Calculadoras de fechas",
    intro:
      "Calcula fechas clave. Son orientativas: no tienen en cuenta festivos locales ni situaciones especiales.",
    fecha: "Fecha",
    calcular: "Calcular",
    resultado: "Resultado",
  },
  reportar: {
    titulo: "Reportar información desactualizada",
  },
  novedades: {
    titulo: "Novedades normativas",
    intro: "Cambios recientes en las normas de extranjería, explicados.",
    afecta: "Afecta a",
  },
};

export default es;
export type Messages = typeof es;
