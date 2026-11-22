import type { Arbol } from "./tipos";

/**
 * Árbol de decisión "¿Qué trámite necesito?".
 *
 * Reglas editoriales:
 * - Preguntas cortas, sin jerga; una sola cosa por pregunta.
 * - Los resultados orientan, no deciden: siempre remiten a la ficha con los requisitos completos.
 * - Si el caso es delicado (asilo, menores, expulsión, antecedentes) → recomendarAyuda: true.
 * - Base legal de las ramas de arraigo: arts. 125-127 del Reglamento (RD 1155/2024).
 * - Los cambios aquí deben pasar `npm test` (asistente.test.ts valida el árbol completo).
 */

const OFICIALES = {
  migraciones: { titulo: "Portal de Migraciones (Ministerio de Inclusión)", url: "https://www.inclusion.gob.es/web/migraciones" },
  sede: { titulo: "Sede electrónica de extranjería", url: "https://sede.administracionespublicas.gob.es" },
  exteriores: { titulo: "Ministerio de Asuntos Exteriores: visados y consulados", url: "https://www.exteriores.gob.es" },
  interior: { titulo: "Ministerio del Interior: protección internacional", url: "https://www.interior.gob.es" },
  policia: { titulo: "Policía Nacional: documentación de extranjeros", url: "https://www.policia.es" },
};

export const ARBOL: Arbol = {
  inicio: "donde",
  nodos: {
    /* ---------------------------------------------------------------- */
    donde: {
      tipo: "pregunta",
      id: "donde",
      texto: "¿Dónde estás ahora?",
      opciones: [
        { id: "espana", etiqueta: "En España", siguiente: "ue" },
        { id: "fuera", etiqueta: "Fuera de España", siguiente: "fuera-ue" },
      ],
    },

    /* ----------------------------- Fuera ----------------------------- */
    "fuera-ue": {
      tipo: "pregunta",
      id: "fuera-ue",
      texto: "¿Tienes la nacionalidad de un país de la Unión Europea, de Noruega, Islandia, Liechtenstein o Suiza?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "res-ue" },
        { id: "no", etiqueta: "No", siguiente: "fuera-motivo" },
      ],
    },
    "fuera-motivo": {
      tipo: "pregunta",
      id: "fuera-motivo",
      texto: "¿Para qué quieres venir a España?",
      opciones: [
        { id: "estudiar", etiqueta: "Para estudiar", siguiente: "res-fuera-estudios" },
        { id: "trabajar", etiqueta: "Para trabajar o teletrabajar", siguiente: "res-fuera-trabajo" },
        { id: "familia", etiqueta: "Para vivir con mi familia que ya está en España", siguiente: "res-fuera-familia" },
        { id: "proteccion", etiqueta: "Huyo de persecución o guerra", siguiente: "res-proteccion" },
        { id: "rentas", etiqueta: "Para vivir sin trabajar, con mis propios ingresos", siguiente: "res-fuera-no-lucrativa" },
      ],
    },
    "res-fuera-estudios": {
      tipo: "resultado",
      id: "res-fuera-estudios",
      titulo: "Visado de estudios",
      explicacion:
        "Lo normal es pedir el visado de estudios en el consulado de España de tu país antes de viajar. Necesitarás la admisión en un centro de estudios.",
      tramites: [],
      proximamente: ["Autorización de estudios"],
      enlaces: [OFICIALES.exteriores, OFICIALES.migraciones],
    },
    "res-fuera-trabajo": {
      tipo: "resultado",
      id: "res-fuera-trabajo",
      titulo: "Visado de trabajo o de teletrabajo",
      explicacion:
        "Hay varias vías: contratación desde origen por una empresa española, perfiles altamente cualificados, emprendedores o teletrabajo internacional (nómadas digitales). Casi todas se piden antes de viajar.",
      tramites: [],
      proximamente: ["Residencia y trabajo por cuenta ajena", "Teletrabajo internacional (nómada digital)", "Profesionales altamente cualificados"],
      enlaces: [OFICIALES.exteriores, OFICIALES.migraciones],
    },
    "res-fuera-familia": {
      tipo: "resultado",
      id: "res-fuera-familia",
      titulo: "Reagrupación familiar o tarjeta de familiar",
      explicacion:
        "Si tu familiar es **español o de la UE**, el trámite es distinto que si es de otro país con residencia en España. En el segundo caso, normalmente es tu familiar quien inicia la **reagrupación familiar** desde España.",
      tramites: [],
      proximamente: ["Reagrupación familiar", "Residencia de familiar de español o de ciudadano de la UE"],
      enlaces: [OFICIALES.migraciones, OFICIALES.exteriores],
    },
    "res-fuera-no-lucrativa": {
      tipo: "resultado",
      id: "res-fuera-no-lucrativa",
      titulo: "Residencia no lucrativa",
      explicacion:
        "Es para quien puede vivir en España con sus propios medios económicos, sin trabajar. Se pide en el consulado antes de viajar.",
      tramites: [],
      proximamente: ["Residencia no lucrativa"],
      enlaces: [OFICIALES.exteriores, OFICIALES.migraciones],
    },

    /* ----------------------------- España ---------------------------- */
    ue: {
      tipo: "pregunta",
      id: "ue",
      texto: "¿Tienes la nacionalidad de un país de la Unión Europea, de Noruega, Islandia, Liechtenstein o Suiza?",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "res-ue" },
        { id: "no", etiqueta: "No", siguiente: "situacion" },
      ],
    },
    "res-ue": {
      tipo: "resultado",
      id: "res-ue",
      titulo: "Certificado de registro de ciudadano de la UE",
      explicacion:
        "Como ciudadano de la UE o asimilado no necesitas visado. Si vas a quedarte más de 3 meses, debes inscribirte en el Registro Central de Extranjeros y obtener el **certificado de registro**.",
      tramites: [],
      proximamente: ["Certificado de registro de ciudadano de la UE"],
      enlaces: [OFICIALES.policia, OFICIALES.sede],
    },
    situacion: {
      tipo: "pregunta",
      id: "situacion",
      texto: "¿Cuál es tu situación ahora mismo?",
      opciones: [
        { id: "residente", etiqueta: "Tengo tarjeta de residencia (en vigor o en renovación)", siguiente: "residente" },
        { id: "regularizacion", etiqueta: "Pedí la regularización extraordinaria de 2026", siguiente: "res-regularizacion" },
        { id: "asilo", etiqueta: "He pedido asilo (protección internacional)", siguiente: "res-asilo-solicitante" },
        { id: "estudios", etiqueta: "Estoy con autorización de estudios", siguiente: "res-estudios" },
        { id: "sin", etiqueta: "No tengo papeles en regla (o se me caducaron)", siguiente: "familia-es-ue" },
      ],
    },

    /* --------------------------- Residente -------------------------- */
    residente: {
      tipo: "pregunta",
      id: "residente",
      texto: "¿Qué quieres hacer?",
      opciones: [
        { id: "renovar", etiqueta: "Renovar o prorrogar mi autorización", siguiente: "res-renovar" },
        { id: "nacionalidad", etiqueta: "Pedir la nacionalidad española", siguiente: "res-nacionalidad" },
        { id: "familia", etiqueta: "Traer a mi familia", siguiente: "res-reagrupar" },
        { id: "larga", etiqueta: "Conseguir la residencia de larga duración", siguiente: "res-larga" },
      ],
    },
    "res-renovar": {
      tipo: "resultado",
      id: "res-renovar",
      titulo: "Renovación o prórroga",
      explicacion:
        "Por regla general, la renovación se pide **en los 2 meses antes** de que caduque tu autorización. También se admite hasta 3 meses después, pero te pueden multar. Usa la calculadora para ver tus fechas.",
      tramites: [],
      proximamente: ["Renovaciones de autorizaciones temporales"],
      enlaces: [{ titulo: "Calculadora de renovación", url: "/es/calculadoras#renovacion" }, OFICIALES.sede],
    },
    "res-nacionalidad": {
      tipo: "resultado",
      id: "res-nacionalidad",
      titulo: "Nacionalidad por residencia",
      explicacion:
        "Necesitas residencia **legal, continuada e inmediatamente anterior** a la solicitud: 10 años en general, 5 si tienes estatuto de refugiado, 2 para nacionales de países iberoamericanos y algunos otros, y 1 año en casos concretos.",
      tramites: ["nacionalidad-residencia"],
      enlaces: [{ titulo: "Calculadora de nacionalidad", url: "/es/calculadoras#nacionalidad" }],
    },
    "res-reagrupar": {
      tipo: "resultado",
      id: "res-reagrupar",
      titulo: "Reagrupación familiar",
      explicacion:
        "Si tienes residencia en España, puedes pedir que tu familia venga con la reagrupación familiar, cumpliendo requisitos de tiempo de residencia, vivienda y medios económicos.",
      tramites: ["reagrupacion-familiar"],
      enlaces: [OFICIALES.migraciones],
    },
    "res-larga": {
      tipo: "resultado",
      id: "res-larga",
      titulo: "Residencia de larga duración",
      explicacion:
        "Por regla general, se puede pedir tras 5 años de residencia legal y continuada en España.",
      tramites: [],
      proximamente: ["Residencia de larga duración", "Residencia de larga duración UE"],
      enlaces: [OFICIALES.migraciones],
    },

    /* ------------------------- Regularización ------------------------ */
    "res-regularizacion": {
      tipo: "resultado",
      id: "res-regularizacion",
      titulo: "Después de la regularización 2026",
      explicacion:
        "El plazo para pedirla terminó el 30 de junio de 2026. Te explicamos qué pasa si te la conceden, si no te contestan en 3 meses (se entiende denegada) y cómo prorrogarla.",
      tramites: ["despues-regularizacion-2026"],
    },

    /* ------------------------------ Asilo ---------------------------- */
    "res-asilo-solicitante": {
      tipo: "resultado",
      id: "res-asilo-solicitante",
      titulo: "Eres solicitante de protección internacional",
      explicacion:
        "Mientras seas solicitante de asilo **no puedes pedir un arraigo** (art. 126.a del Reglamento), y ese tiempo no cuenta para los 2 años del arraigo hasta que haya resolución firme. Renunciar al asilo para pedir otra cosa es una decisión importante: **consúltalo antes, gratis, con una ONG** como CEAR, Accem o Cruz Roja.",
      tramites: ["proteccion-internacional"],
      proximamente: ["Qué hacer si te deniegan el asilo"],
      enlaces: [OFICIALES.interior, { titulo: "Ayuda gratuita", url: "/es/ayuda" }],
      recomendarAyuda: true,
    },
    "res-proteccion": {
      tipo: "resultado",
      id: "res-proteccion",
      titulo: "Protección internacional (asilo)",
      explicacion:
        "Si en tu país corres peligro por persecución o guerra, puedes pedir protección internacional. Desde el 12 de junio de 2026 se aplica el nuevo Pacto Europeo de Migración y Asilo. Busca **asistencia jurídica gratuita** cuanto antes.",
      tramites: ["proteccion-internacional"],
      enlaces: [OFICIALES.interior, { titulo: "Ayuda gratuita", url: "/es/ayuda" }],
      recomendarAyuda: true,
    },

    /* ----------------------------- Estudios -------------------------- */
    "res-estudios": {
      tipo: "resultado",
      id: "res-estudios",
      titulo: "Pasar de estudios a otra autorización",
      explicacion:
        "Para cambiar de estudios a trabajo u otra autorización, la solicitud se presenta entre **2 meses antes y 3 meses después** de que termine tu autorización de estudios o de que obtengas el título (art. 190.6 del Reglamento). Pedirlo en ese plazo mantiene válida tu autorización hasta que resuelvan.",
      tramites: [],
      proximamente: ["Autorización de estudios", "Modificaciones de autorización"],
      enlaces: [OFICIALES.migraciones],
    },

    /* ------------------------- Sin autorización ---------------------- */
    "familia-es-ue": {
      tipo: "pregunta",
      id: "familia-es-ue",
      texto: "¿Alguna de estas situaciones es la tuya?",
      opciones: [
        {
          id: "menor",
          etiqueta: "Soy padre, madre o tutor de un menor español o de otro país de la UE que vive en España",
          siguiente: "res-arraigo-familiar",
        },
        {
          id: "apoyo",
          etiqueta: "Apoyo y convivo con un familiar español o de la UE con discapacidad",
          siguiente: "res-arraigo-familiar",
        },
        {
          id: "pareja",
          etiqueta: "Mi pareja o mi padre/madre/hijo es español",
          siguiente: "res-familiar-espanol",
        },
        { id: "ninguna", etiqueta: "Ninguna de estas", siguiente: "tiempo" },
      ],
    },
    "res-arraigo-familiar": {
      tipo: "resultado",
      id: "res-arraigo-familiar",
      titulo: "Arraigo familiar",
      explicacion:
        "No exige un tiempo mínimo en España. Da una autorización de **5 años** que permite trabajar.",
      tramites: ["arraigo-familiar"],
    },
    "res-familiar-espanol": {
      tipo: "resultado",
      id: "res-familiar-espanol",
      titulo: "Residencia de familiar de ciudadano español",
      explicacion:
        "Los familiares de españoles tienen un régimen propio en el Reglamento (arts. 94 y siguientes). Desde abril de 2026 pueden pedirlo desde España junto con el familiar español, y en 2026 el Tribunal Supremo eliminó algunos requisitos. Si además eres padre o madre de un menor español, mira también el arraigo familiar.",
      tramites: ["familiar-de-espanol", "arraigo-familiar"],
      enlaces: [OFICIALES.migraciones],
    },
    tiempo: {
      tipo: "pregunta",
      id: "tiempo",
      texto: "¿Cuánto tiempo llevas viviendo en España sin salir?",
      ayuda: "Cuenta desde que llegaste (o desde tu última entrada). Si fuiste solicitante de asilo, ese tiempo puede no contar.",
      opciones: [
        { id: "menos2", etiqueta: "Menos de 2 años", siguiente: "res-menos-2" },
        { id: "mas2", etiqueta: "2 años o más", siguiente: "segunda" },
      ],
    },
    "res-menos-2": {
      tipo: "resultado",
      id: "res-menos-2",
      titulo: "Todavía no puedes pedir un arraigo por tiempo",
      explicacion:
        "Los arraigos social, sociolaboral, socioformativo y de segunda oportunidad exigen **2 años de permanencia continuada** (art. 126.b del Reglamento). Usa la calculadora para saber desde qué fecha podrás pedirlo, y mientras tanto **empadrónate** y guarda pruebas de que vives aquí. Si huiste de persecución, infórmate sobre el asilo.",
      tramites: ["empadronamiento"],
      enlaces: [{ titulo: "Calculadora de arraigo", url: "/es/calculadoras#arraigo" }, { titulo: "Ayuda gratuita", url: "/es/ayuda" }],
    },
    segunda: {
      tipo: "pregunta",
      id: "segunda",
      texto: "En los últimos 2 años, ¿tuviste una autorización de residencia que no pudiste renovar?",
      ayuda: "No cuentan las autorizaciones por circunstancias excepcionales (como un arraigo anterior).",
      opciones: [
        { id: "si", etiqueta: "Sí", siguiente: "res-segunda" },
        { id: "no", etiqueta: "No", siguiente: "via" },
      ],
    },
    "res-segunda": {
      tipo: "resultado",
      id: "res-segunda",
      titulo: "Arraigo de segunda oportunidad",
      explicacion:
        "Es para quien tuvo una autorización de residencia en los 2 años anteriores y no la pudo renovar por motivos que no sean de orden público, seguridad o salud pública. Revisa también los otros arraigos por si encajas mejor.",
      tramites: ["arraigo-segunda-oportunidad", "arraigo-sociolaboral", "arraigo-social"],
    },
    via: {
      tipo: "pregunta",
      id: "via",
      texto: "¿Cuál de estas opciones tienes o puedes conseguir?",
      opciones: [
        { id: "contrato", etiqueta: "Un contrato de trabajo (o varios) que sumen al menos 20 horas a la semana", siguiente: "res-sociolaboral" },
        { id: "formacion", etiqueta: "Matricularme en una formación (FP, certificado de profesionalidad, etc.)", siguiente: "res-socioformativo" },
        { id: "familia", etiqueta: "Familia directa con residencia en España, o ingresos propios", siguiente: "res-social" },
        { id: "nada", etiqueta: "Ninguna de las anteriores", siguiente: "res-nada" },
      ],
    },
    "res-sociolaboral": {
      tipo: "resultado",
      id: "res-sociolaboral",
      titulo: "Arraigo sociolaboral",
      explicacion:
        "Con 2 años en España y un contrato (o varios) que sumen al menos 20 horas semanales y paguen como mínimo el salario mínimo proporcional. Cuando admiten tu solicitud, ya puedes trabajar de forma provisional.",
      tramites: ["arraigo-sociolaboral"],
    },
    "res-socioformativo": {
      tipo: "resultado",
      id: "res-socioformativo",
      titulo: "Arraigo socioformativo",
      explicacion:
        "Con 2 años en España y matrícula (o compromiso) en una formación de las que admite el Reglamento. Permite trabajar hasta 30 horas a la semana mientras estudias.",
      tramites: ["arraigo-socioformativo"],
    },
    "res-social": {
      tipo: "resultado",
      id: "res-social",
      titulo: "Arraigo social",
      explicacion:
        "Con 2 años en España y vínculos con familiares directos que tengan residencia, o medios económicos propios. También se valora tu esfuerzo de integración mediante un informe de la comunidad autónoma.",
      tramites: ["arraigo-social"],
    },
    "res-nada": {
      tipo: "resultado",
      id: "res-nada",
      titulo: "Tu caso necesita una revisión más detallada",
      explicacion:
        "Puede que aún encajes en algún arraigo si consigues un contrato o una matrícula, o en el arraigo social mediante el informe de integración. También existen otras vías (razones humanitarias, víctimas de violencia…). Te recomendamos una **consulta gratuita** con una ONG o el servicio de orientación jurídica de tu colegio de abogados.",
      tramites: ["arraigo-social", "arraigo-sociolaboral", "arraigo-socioformativo"],
      enlaces: [{ titulo: "Ayuda gratuita", url: "/es/ayuda" }],
      recomendarAyuda: true,
    },
  },
};
