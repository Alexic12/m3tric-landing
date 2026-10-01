/**
 * Single source of truth for every user-facing string of the landing.
 * Claims are limited to what the README and Anexo 1 support (spec §5).
 */
import type { ScaleId } from "@/types";

export type ProductIcon = "sensors" | "analytics" | "map";
export type CaseIcon = "risk" | "agro" | "infra" | "environment";
export type Status = "available" | "evolving";

export const navItems = [
  { id: "propuesta", label: "Propuesta" },
  { id: "plataforma", label: "Plataforma" },
  { id: "escalas", label: "Escalas" },
  { id: "productos", label: "Productos" },
  { id: "capacidades", label: "Capacidades" },
  { id: "tecnologia", label: "Tecnología" },
  { id: "casos", label: "Casos de uso" },
  { id: "contacto", label: "Contacto" },
] as const;

export const a11y = {
  skipLink: "Saltar al contenido",
  homeLink: "M3TRIC, ir al inicio",
  mainNav: "Navegación principal",
  mobileNav: "Navegación del menú",
  openMenu: "Abrir menú",
  closeMenu: "Cerrar menú",
  menuDialog: "Menú de navegación",
  footerNav: "Navegación del pie de página",
  layers: "Las tres capas de información de M3TRIC",
  scaleTabs: "Escalas de lectura del territorio",
  platformIllustrationAlt:
    "Ilustración de la interfaz de la plataforma: mapa con sensores, serie temporal y lista de alertas por nivel",
} as const;

const PLATFORM_VERB = "Abrir";
const PLATFORM_NOUN = "plataforma";

export const cta = {
  platform: `${PLATFORM_VERB} ${PLATFORM_NOUN}`,
  /** Split form for the compact header button, where the verb is visually hidden on narrow screens. */
  platformVerb: PLATFORM_VERB,
  platformNoun: PLATFORM_NOUN,
  team: "Hablar con el equipo",
  writeTeam: "Escribir al equipo",
  mailSubject: "Contacto desde el sitio M3TRIC",
} as const;

export const brand = {
  tagline: "Entender el territorio para anticipar el riesgo.",
  rights: "Todos los derechos reservados.",
} as const;

export const footer = {
  sections: "Secciones",
} as const;

export const statusLabels: Record<Status, string> = {
  available: "Disponible",
  evolving: "En evolución",
};

export const notFound = {
  code: "Error 404",
  title: "Esta página no existe",
  text: "El enlace que siguió no corresponde a ningún contenido de M3TRIC.",
  back: "Volver al inicio",
} as const;

export const hero = {
  meta: "Lectura multiescala del territorio",
  titleBold: "Entender el territorio",
  titleLight: "para anticipar el riesgo.",
  lead: "M3TRIC está diseñado para integrar sensores en campo, observación aérea e información satelital con modelos analíticos, y ofrecer una lectura integral del comportamiento del terreno.",
  imageAlt: "",
  layers: [
    { label: "Sensores en campo", active: 1 },
    { label: "Drones", active: 2 },
    { label: "Información satelital", active: 3 },
  ],
} as const;

export const proposal = {
  index: "01",
  kicker: "Propuesta de valor",
  statement: [
    { text: "La lectura multiescala", bold: true },
    { text: " del territorio, basada en la integración de datos, es el núcleo de ", bold: false },
    { text: "nuestra solución.", bold: true },
  ],
  paragraphs: [
    "En territorios complejos, el problema no es la falta de datos, sino la dificultad para integrarlos y convertirlos en decisiones oportunas.",
    "M3TRIC responde a esta brecha: combina sensores en campo, drones e información satelital con modelos analíticos en un solo sistema, para interpretar variables del terreno en distintos niveles.",
  ],
  globeAlt: "Globo terráqueo nocturno atravesado por líneas de conexión entre regiones",
  values: [
    {
      title: "Rigor técnico",
      text: "Soluciones basadas en evidencia, modelos analíticos y validación en campo.",
    },
    {
      title: "Precisión",
      text: "Información confiable y detallada para decisiones críticas, gracias a la conexión de múltiples fuentes.",
    },
    {
      title: "Confiabilidad",
      text: "Consistencia en la información que soporta decisiones críticas.",
    },
  ],
} as const;

export const platform = {
  index: "02",
  kicker: "Plataforma",
  title: "¿Cómo lo hacemos?",
  lead: "Del dato disperso a la decisión oportuna, en cuatro pasos.",
  steps: [
    {
      title: "Capturamos información",
      text: "Integramos datos de sensores en campo y, progresivamente, imágenes aéreas y satelitales.",
    },
    {
      title: "Analizamos el terreno",
      text: "Aplicamos modelos para interpretar las condiciones del suelo en diferentes escalas.",
    },
    {
      title: "Identificamos zonas clave",
      text: "Detectamos áreas de riesgo o potencial productivo.",
    },
    {
      title: "Entregamos decisiones",
      text: "Indicadores y alertas accionables para la toma de decisiones.",
    },
  ],
  mockCaption: "Vista ilustrativa de la plataforma",
} as const;

export const scales = {
  index: "03",
  kicker: "Escalas",
  title: "El comportamiento del territorio no ocurre en un solo nivel.",
  lead: "M3TRIC lo lee en tres escalas que se complementan.",
  items: [
    {
      id: "m1",
      code: "M1",
      name: "Micro",
      reads: "Observaciones y estado de sensores en puntos específicos.",
      source: "Sensores en campo",
      status: "available",
    },
    {
      id: "m2",
      code: "M2",
      name: "Meso",
      reads: "Agregaciones, tendencias y patrones en zonas y cuencas.",
      source: "Drones y agregación regional",
      status: "evolving",
    },
    {
      id: "m3",
      code: "M3",
      name: "Macro",
      reads: "Visión territorial para decisiones estratégicas.",
      source: "Información satelital",
      status: "evolving",
    },
  ] satisfies ReadonlyArray<{
    id: ScaleId;
    code: string;
    name: string;
    reads: string;
    source: string;
    status: Status;
  }>,
  labels: { reads: "Qué lee", source: "Fuente principal" },
} as const;

export const products = {
  index: "04",
  kicker: "Productos",
  title: "Tres líneas de producto, una sola lectura.",
  items: [
    {
      icon: "sensors",
      title: "Sensórica e integración",
      text: "Las observaciones de sensores en campo entran al sistema ordenadas, normalizadas y validadas.",
      bullets: ["Ingesta individual y por lotes", "Normalización de datos", "Validación de observaciones"],
      status: "available",
    },
    {
      icon: "analytics",
      title: "Analítica territorial",
      text: "Estadísticas, tendencias, agrupamiento espacial y consultas geográficas.",
      bullets: ["Estadísticas y tendencias", "Agrupamiento espacial", "Consultas geográficas"],
      status: "available",
    },
    {
      icon: "map",
      title: "Visualización y alertas",
      text: "Lo que miden los sensores, visible en un mapa y comunicado como alertas y reportes.",
      bullets: [
        "Mapa de sensores con última lectura",
        "Alertas por cruce de umbral",
        "Reportes: CSV, resumen ambiental, salud de sensores, alertas y análisis espacial",
      ],
      status: "available",
    },
  ] satisfies ReadonlyArray<{
    icon: ProductIcon;
    title: string;
    text: string;
    bullets: readonly string[];
    status: Status;
  }>,
  evolvingNote: {
    text: "Integración de drones e información satelital a escala meso y macro; modelos predictivos.",
  },
} as const;

export const capabilities = {
  index: "05",
  kicker: "Capacidades",
  title: "Lo que existe hoy y hacia dónde vamos.",
  lead: "Distinguimos con claridad lo que la plataforma ya hace de lo que está en desarrollo.",
  available: {
    title: "Disponible hoy",
    items: [
      "API de datos con autenticación y roles",
      "Gestión de localizaciones, sensores y observaciones",
      "Ingesta individual y por lotes con validación",
      "Alertas deduplicadas por cruce de umbral",
      "Estadísticas, tendencias y análisis espacial",
      "Mapa de sensores con última lectura",
      "Reportes exportables",
      "Infraestructura como código en AWS",
    ],
  },
  evolving: {
    title: "En evolución",
    items: [
      "Lectura meso y macro (drones y satélite)",
      "Detección general de anomalías",
      "Procesamiento asíncrono y reportes en la nube",
      "Modelos predictivos",
    ],
  },
  legend: {
    title: "Escala de interpretación",
    text: "La plataforma comunica el nivel de cada alerta con tres niveles, siempre acompañados de su nombre.",
    levels: [
      { label: "Atención", swatch: "bg-m3-yellow" },
      { label: "Alerta", swatch: "bg-m3-orange" },
      { label: "Crítico", swatch: "bg-m3-red" },
    ],
  },
} as const;

export const technology = {
  index: "06",
  kicker: "Tecnología",
  title: "Del dato en campo a la decisión.",
  lead: "Un flujo de datos de extremo a extremo, construido sobre tecnologías de código abierto y servicios en la nube.",
  flow: [
    "Captura",
    "Ingesta y validación",
    "Almacenamiento geoespacial",
    "Análisis",
    "Visualización y alertas",
  ],
  stack: [
    { group: "Datos y API", items: ["Python 3.11", "FastAPI", "SQLAlchemy"] },
    { group: "Geoespacial", items: ["PostgreSQL 16", "PostGIS 3.4"] },
    { group: "Interfaz", items: ["React", "TypeScript", "Next.js"] },
    { group: "Nube", items: ["AWS CDK"] },
  ],
} as const;

export const useCases = {
  index: "07",
  kicker: "Casos de uso",
  title: "Un mismo método, cuatro frentes.",
  imageAlt: "Vista aérea de una ladera cultivada con una red de puntos y líneas superpuesta",
  items: [
    {
      icon: "risk",
      title: "Gestión del riesgo",
      scope: "Deslizamientos y movimientos en masa",
      text:
        "El comportamiento del terreno empieza mucho antes de que sea visible. El reto no es reaccionar mejor, es poder leer esas señales a tiempo.",
    },
    {
      icon: "agro",
      title: "Monitoreo agrícola",
      scope: "Variabilidad del suelo y eficiencia productiva",
      text: "El suelo no se comporta igual en toda la extensión de un cultivo.",
    },
    {
      icon: "infra",
      title: "Infraestructura",
      scope: "Estabilidad del entorno de obras y activos lineales",
      // Pendiente de aprobación editorial (ronda de ajustes 1)
      text: "Lectura continua del terreno alrededor de obras y activos para anticipar cambios en su estabilidad.",
    },
    {
      icon: "environment",
      title: "Ambiente",
      scope: "Variables hídricas, climáticas y ambientales en distintos niveles",
      // Pendiente de aprobación editorial (ronda de ajustes 1)
      text: "Integración de variables hídricas, climáticas y ambientales para entender cómo interactúan en el territorio.",
    },
  ] satisfies ReadonlyArray<{
    icon: CaseIcon;
    title: string;
    scope: string;
    text: string;
  }>,
} as const;

export const contact = {
  index: "08",
  kicker: "Contacto",
  titleBold1: "Entender mejor",
  titleLight: "para",
  titleBold2: "decidir mejor",
  text: "Cuéntenos qué territorio necesita entender. Le mostramos cómo M3TRIC integra sus datos en una sola lectura.",
  imageAlt: "Vista aérea vertical de una ladera cultivada con una red de puntos y líneas superpuesta",
  emailLabel: "Correo",
  phoneLabel: "Teléfono",
} as const;
