---
# PLANTILLA DE FICHA. Copia este archivo como content/tramites/<slug>.md (sin guion bajo).
# Los archivos que empiezan por "_" se ignoran. Los tests validan cada ficha contra src/content/schema.ts.
# Reglas:
#  - Cada requisito necesita al menos una fuente, o un `pendiente_de_verificar` que explique qué falta.
#  - Los requisitos NUNCA pueden apoyarse solo en fuentes de nivel 3 (foros).
#  - Si hay algún `pendiente_de_verificar`, el estado debe ser `borrador`.
#  - Fechas entre comillas: "AAAA-MM-DD". Textos con ":" entre comillas.
#  - Redacta con tus palabras; no copies texto literal de webs ni foros. Sin datos personales.
titulo: "Nombre del trámite"
slug: nombre-del-tramite
categoria: documentacion # documentacion | estancias-visados | arraigos-regularizacion | familia | trabajo-residencia | proteccion-internacional | nacionalidad | vida-practica
resumen_en_una_frase: "Qué es y para qué sirve, en una frase."
estado: borrador # borrador | revisado
ultima_verificacion: "2026-01-01"
enlace_oficial:
  titulo: "Página oficial principal del trámite"
  url: "https://www.boe.es/"
palabras_clave: [sinonimo, otra forma de llamarlo]
relacionados: []

para_quien:
  - texto: "Perfil exacto de la persona."
    fuentes: [boe]
para_quien_NO:
  - texto: "Caso parecido que necesita otro trámite"
    # ver: slug-de-otra-ficha

requisitos:
  - texto: "Requisito verificable."
    fuentes: [boe]
    detalle: "Artículo concreto."
  - texto: "Requisito dudoso."
    pendiente_de_verificar: "Qué falta comprobar y dónde."

documentos:
  - texto: "Documento."
    donde: "Dónde se consigue"
    legalizacion: segun_pais # no | apostilla_o_legalizacion | segun_pais
    traduccion_jurada: true
    fuentes: [boe]

pasos:
  - texto: "Acción concreta."
    modo: online # online | presencial | online_o_presencial
    enlace: "https://sede.administracionespublicas.gob.es"
    fuentes: [boe]

tasas:
  - modelo: "Modelo 790, código XXX"
    importe: "00,00 €"
    texto: "Cómo pagarla."
    fuentes: [boe]

plazos:
  - texto: "Plazo de resolución y silencio."
    fuentes: [boe]

tiempos_reales: []
  # - texto: "Lo que cuentan los usuarios (sin datos personales)."
  #   provincia: "Madrid"
  #   periodo: "oct.–nov. 2026"
  #   fuentes: [foro]

errores_frecuentes: []
motivos_de_denegacion_habituales: []
que_hacer_si_deniegan: []
cuando_buscar_ayuda_profesional: []

normativa:
  - norma: "Norma"
    articulos: "arts. X-Y"
    url: "https://www.boe.es/"

fuentes:
  - id: boe
    titulo: "Título de la fuente"
    url: "https://www.boe.es/"
    nivel: 1 # 1 oficial | 2 secundaria fiable | 3 experiencia de usuarios
    consultada: "2026-01-01"

preguntas_frecuentes: []
---

## En pocas palabras

Explicación breve en lenguaje sencillo.
