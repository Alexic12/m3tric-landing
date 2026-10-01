/**
 * Single source of truth for every user-facing string of the landing.
 * Claims are limited to what the README and Anexo 1 support (spec §5).
 * Everything above the technical zone is written for non-technical readers (spec §2).
 */
import type { ScaleId } from "@/types";

export type BenefitIcon = "monitor" | "alerts" | "reports";
export type OutcomeIcon = "alerts" | "map" | "reports";
export type CaseIcon = "risk" | "agro" | "infra" | "environment";
export type SecurityIcon = "roles" | "encryption" | "code";
export type Status = "available" | "evolving";

export const navItems = [
  { id: "beneficios", label: "Beneficios" },
  { id: "casos", label: "Casos de uso" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "escalas", label: "Escalas" },
  { id: "preguntas", label: "Preguntas" },
  { id: "tecnico", label: "Técnico" },
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
  outcomes: "Lo que obtiene con M3TRIC",
  scaleTabs: "Escalas de lectura del territorio",
  platformIllustrationAlt:
    "Ilustración de la interfaz de la plataforma: mapa con sensores, serie temporal y lista de alertas por nivel",
} as const;

const PLATFORM_VERB = "Abrir";
const PLATFORM_NOUN = "plataforma";
const TEAM_VERB = "Hablar";
const TEAM_REST = "con el equipo";

export const cta = {
  platform: `${PLATFORM_VERB} ${PLATFORM_NOUN}`,
  team: `${TEAM_VERB} ${TEAM_REST}`,
  /** Split form for the compact header button, where the tail is visually hidden on narrow screens. */
  teamVerb: TEAM_VERB,
  teamRest: TEAM_REST,
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
  meta: "Monitoreo del territorio",
  titleBold: "Entender el territorio",
  titleLight: "para anticipar el riesgo.",
  lead: "M3TRIC reúne en un solo lugar la información de los sensores instalados en su terreno, le avisa cuando algo cambia y le entrega reportes claros para decidir a tiempo.",
  imageAlt: "",
  outcomes: [
    {
      icon: "alerts",
      label: "Avisos a tiempo",
      text: "Alertas por niveles cuando una medición cruza su límite.",
    },
    {
      icon: "map",
      label: "Un mapa claro de su terreno",
      text: "Sus sensores y su última lectura, en un solo lugar.",
    },
    {
      icon: "reports",
      label: "Reportes para decidir",
      text: "Resúmenes y datos descargables para su equipo.",
    },
  ] satisfies ReadonlyArray<{ icon: OutcomeIcon; label: string; text: string }>,
} as const;

export const benefits = {
  index: "01",
  kicker: "Lo que usted obtiene",
  title: "Información clara para decidir, no más datos sueltos.",
  deliverablesLabel: "Lo que recibe",
  items: [
    {
      icon: "monitor",
      title: "Vigilancia continua de su terreno",
      text: "Sus sensores en campo envían datos que M3TRIC recibe, revisa y organiza. Usted ve la última lectura de cada punto y si algún sensor dejó de reportar.",
      deliverables: ["Tablero de sensores", "Estado y última lectura", "Historial de mediciones"],
      status: "available",
    },
    {
      icon: "alerts",
      title: "Avisos cuando importa",
      text: "Usted define los límites aceptables. Cuando una medición los cruza, M3TRIC genera una alerta con su nivel: Atención, Alerta o Crítico.",
      deliverables: ["Alertas por niveles", "Registro de eventos", "Sin avisos duplicados"],
      status: "available",
    },
    {
      icon: "reports",
      title: "Reportes para decidir",
      text: "Tendencias, comparaciones por zona y reportes listos para comités, entes de control o su equipo.",
      deliverables: [
        "Resumen ambiental",
        "Salud de sensores",
        "Reporte de alertas",
        "Análisis espacial",
        "Exportación CSV",
      ],
      status: "available",
    },
  ] satisfies ReadonlyArray<{
    icon: BenefitIcon;
    title: string;
    text: string;
    deliverables: readonly string[];
    status: Status;
  }>,
  evolvingNote: "Integración de drones e imágenes satelitales para leer zonas y regiones completas.",
} as const;

export const useCases = {
  index: "02",
  kicker: "Para quién es",
  title: "Un mismo método para cuatro frentes.",
  imageAlt: "Vista aérea de una ladera cultivada con una red de puntos y líneas superpuesta",
  situationLabel: "La situación",
  givesLabel: "Lo que obtiene",
  items: [
    {
      icon: "risk",
      title: "Gestión del riesgo",
      scope: "Deslizamientos y movimientos en masa",
      situation: "El comportamiento del terreno empieza mucho antes de que sea visible.",
      gives: "Seguimiento continuo de los puntos críticos y avisos cuando una medición cambia.",
    },
    {
      icon: "agro",
      title: "Agricultura",
      scope: "Variabilidad del suelo",
      situation: "El suelo no se comporta igual en toda la extensión de un cultivo.",
      gives: "Lecturas por punto para entender dónde y cuándo actuar.",
    },
    {
      icon: "infra",
      title: "Infraestructura",
      scope: "Obras y activos",
      // Pendiente de aprobación editorial (ronda de ajustes 1)
      situation: "Una obra depende de la estabilidad del terreno que la rodea.",
      gives: "Mediciones periódicas del entorno y alertas ante cambios.",
    },
    {
      icon: "environment",
      title: "Ambiente",
      scope: "Variables hídricas, climáticas y ambientales",
      // Pendiente de aprobación editorial (ronda de ajustes 1)
      situation: "Las variables del ambiente cambian a distintas escalas.",
      gives: "Registro ordenado de las mediciones y reportes para su seguimiento.",
    },
  ] satisfies ReadonlyArray<{
    icon: CaseIcon;
    title: string;
    scope: string;
    situation: string;
    gives: string;
  }>,
  band: {
    title: "¿Su caso es uno de estos? Hablemos.",
  },
} as const;

export const howItWorks = {
  index: "03",
  kicker: "Cómo funciona",
  title: "De la medición en campo a la decisión, en cuatro pasos.",
  steps: [
    { title: "Medimos", text: "Los sensores en su terreno registran las variables que importan." },
    { title: "Revisamos y organizamos", text: "M3TRIC valida cada dato y lo ubica en el mapa." },
    { title: "Le avisamos", text: "Si algo cruza el límite definido, usted recibe una alerta con su nivel." },
    { title: "Usted decide", text: "Con el historial y los reportes, decide con evidencia." },
  ],
  mockCaption: "Vista ilustrativa de la plataforma",
} as const;

export const scales = {
  index: "04",
  kicker: "Escalas",
  title: "El territorio no se entiende desde un solo punto.",
  lead: "M3TRIC organiza la información en tres escalas que se complementan.",
  items: [
    {
      id: "m1",
      code: "M1",
      name: "Punto",
      reads: "Lo que pasa en cada sensor, en detalle.",
      source: "Sensores en campo",
      status: "available",
    },
    {
      id: "m2",
      code: "M2",
      name: "Zona",
      reads: "Cómo se comporta un sector completo.",
      source: "Drones y agregación por zonas",
      status: "evolving",
    },
    {
      id: "m3",
      code: "M3",
      name: "Territorio",
      reads: "La visión de conjunto para decisiones estratégicas.",
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
  labels: { reads: "Qué le muestra", source: "De dónde viene" },
} as const;

export const whyM3tric = {
  index: "05",
  kicker: "Por qué M3TRIC",
  statement: [
    { text: "La lectura del territorio", bold: true },
    { text: " basada en la integración de datos es el ", bold: false },
    { text: "núcleo de lo que hacemos.", bold: true },
  ],
  paragraph:
    "En territorios complejos, el problema no es la falta de datos, sino convertirlos en decisiones a tiempo. M3TRIC reúne la información de sus sensores en un solo lugar. Así usted ve lo que importa y actúa con evidencia.",
  globeAlt: "Globo terráqueo nocturno atravesado por líneas de conexión entre regiones",
  values: [
    {
      title: "Rigor técnico",
      text: "Soluciones basadas en evidencia, modelos analíticos y validación en campo.",
    },
    {
      title: "Precisión",
      text: "Información confiable y detallada para decisiones críticas.",
    },
    {
      title: "Confiabilidad",
      text: "Consistencia en la información que soporta decisiones críticas.",
    },
  ],
} as const;

/** Shape is a contract with layout.tsx, which builds the FAQPage JSON-LD from `items`. */
export const faq: {
  index: string;
  kicker: string;
  title: string;
  items: { question: string; answer: string }[];
} = {
  index: "06",
  kicker: "Preguntas frecuentes",
  title: "Lo que suele preguntarse antes de empezar.",
  items: [
    {
      question: "¿Qué necesito para empezar?",
      answer:
        "Una conversación con nuestro equipo para entender su terreno y qué necesita medir. A partir de ahí definimos juntos la puesta en marcha.",
    },
    {
      question: "¿Qué información integra hoy M3TRIC?",
      answer:
        "Mediciones de sensores en campo. La integración de drones e imágenes satelitales está en evolución.",
    },
    {
      question: "¿Cómo me entero si algo cambia?",
      answer:
        "En la plataforma, con alertas por niveles (Atención, Alerta, Crítico) cuando una medición cruza el límite definido.",
    },
    {
      question: "¿Puedo usar la información fuera de la plataforma?",
      answer: "Sí. Puede descargar reportes y exportar los datos en formato CSV.",
    },
    {
      question: "¿Quién puede ver la información?",
      answer:
        "Solo las personas autorizadas. El acceso es con usuario y contraseña, y cada persona tiene un rol: administración, operación o consulta.",
    },
    {
      question: "¿Dónde se aloja la plataforma?",
      answer: "En infraestructura en la nube de Amazon Web Services (AWS), definida como código.",
    },
  ],
};

export const technical = {
  index: "07",
  kicker: "Para equipos técnicos",
  title: "El detalle, para quien lo necesita.",
  lead: "Capacidades, flujo de datos y tecnología de la plataforma, separando lo que existe hoy de lo que está en evolución.",
  capabilities: {
    label: "Capacidades",
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
  },
  flow: {
    label: "Flujo de datos",
    steps: [
      { title: "Captura", detail: "Sensores en campo" },
      { title: "Ingesta y validación", detail: "Individual y por lotes" },
      { title: "Almacenamiento geoespacial", detail: "PostgreSQL con PostGIS" },
      { title: "Análisis", detail: "Estadísticas, tendencias y espacial" },
      { title: "Visualización y alertas", detail: "Mapa, umbrales y reportes" },
    ],
  },
  stack: {
    label: "Tecnología y seguridad",
    groups: [
      { group: "Datos y API", items: ["Python 3.11", "FastAPI", "SQLAlchemy"] },
      { group: "Geoespacial", items: ["PostgreSQL 16", "PostGIS 3.4"] },
      { group: "Interfaz", items: ["React", "TypeScript", "Next.js (este sitio)"] },
      { group: "Nube", items: ["AWS CDK"] },
    ],
    security: [
      { icon: "roles", text: "Acceso con roles: administración, operación y consulta." },
      { icon: "encryption", text: "Tráfico cifrado (HTTPS)." },
      { icon: "code", text: "Infraestructura versionada como código." },
    ] satisfies ReadonlyArray<{ icon: SecurityIcon; text: string }>,
  },
  legend: {
    title: "Escala de interpretación",
    text: "Cada alerta se comunica con uno de tres niveles, siempre acompañado de su nombre.",
    levels: [
      { label: "Atención", swatch: "bg-m3-yellow" },
      { label: "Alerta", swatch: "bg-m3-orange" },
      { label: "Crítico", swatch: "bg-m3-red" },
    ],
  },
} as const;

export const contact = {
  index: "08",
  kicker: "Hablemos",
  titleBold1: "Entender mejor",
  titleLight: "para",
  titleBold2: "decidir mejor",
  text: "Cuéntenos qué terreno necesita entender. Le mostramos cómo M3TRIC puede ayudarle.",
  pendingChannels: "Los canales de contacto se publicarán con el dominio oficial.",
  imageAlt: "Vista aérea vertical de una ladera cultivada con una red de puntos y líneas superpuesta",
  emailLabel: "Correo",
  phoneLabel: "Teléfono",
} as const;
