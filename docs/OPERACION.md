# Manual técnico de operación y publicación

Procedimiento para compilar la landing a producción, validar el artefacto y publicarlo en AWS (S3 + CloudFront).

**Importante**: Los recursos AWS descritos en este manual **no están desplegados**. Esta guía documenta el procedimiento previsto de acuerdo con los gates G5–G6 del Anexo 1 técnico. La configuración real de AWS es responsabilidad del equipo de infraestructura.

---

## Build de producción

### Preparación

1. **Obtener el repositorio actualizado:**

```bash
cd /ruta/a/m3tric-landing
git pull origin main  # (o la rama de trabajo)
npm ci                # Clean install de dependencias
```

2. **Crear archivo de configuración:**

```bash
cp .env.example .env.production.local
```

3. **Completar variables obligatorias:**

Editar `.env.production.local` con valores aprobados (ejemplo):

```
NEXT_PUBLIC_SITE_URL=https://m3tric.co
NEXT_PUBLIC_PLATFORM_URL=https://app.m3tric.co/login
NEXT_PUBLIC_CONTACT_EMAIL=info@m3tric.co
NEXT_PUBLIC_CONTACT_PHONE=+573001234567
```

**Validación prévia:**

```bash
npm run check:config
# Output: "check:config OK" si todo está correcto
# Si falla, revisar el mensaje de error y corregir antes de continuar
```

### Compilación

```bash
npm run release
```

Este comando ejecuta el pipeline completo **en orden**:

1. **Validación de configuración** (`check:config`)
   - Verifica que `NEXT_PUBLIC_SITE_URL` y `NEXT_PUBLIC_PLATFORM_URL` sean URLs HTTPS válidas
   - Verifica que `NEXT_PUBLIC_CONTACT_EMAIL` sea un email válido (no de prueba)
   - Falla si falta alguna variable obligatoria

2. **Linting** (`lint`)
   - ESLint valida el código (sin fix automático)
   - Si hay errores, falla y solicita correcciones

3. **Typecheck** (`typecheck`)
   - TypeScript valida tipos sin generar archivos
   - Detecta errores de contrato de componentes

4. **Build estático** (`next build`)
   - Compila React a HTML/CSS/JS estático
   - Genera `out/` con todas las páginas pre-renderizadas
   - Tarda ~30-60 s según el hardware

5. **Validación del artefacto** (`check:artifact`)
   - Escanea `out/` buscando contenido prohibido:
     - URLs de desarrollo: `localhost`, `127.0.0.1`, `example.com`
     - Palabras prohibidas: `TODO`, `lorem`, `placeholder`
   - Verifica que existan archivos requeridos:
     - `index.html` — página principal
     - `404.html` — error page
     - `robots.txt` — SEO
     - `sitemap.xml` — SEO
     - `og.png` — Open Graph
     - `icon.svg`, `apple-icon.png`, `icon-192.png`, `icon-512.png` — favicons

**Si cualquier paso falla**, el build se detiene con código de salida 1 y no hay `out/` parcial. Revisar el error y corregir.

### Output

Si el build es exitoso:

```
check:config OK
...
check:artifact OK
```

**Artefacto**: `out/` contiene el sitio estático listo para publicar.

**Estructura de `out/`:**

```
out/
├── index.html          # Página principal (sin extensión)
├── 404.html            # Error personalizado (servido como 404)
├── robots.txt          # Instrucciones para motores de búsqueda
├── sitemap.xml         # Índice de páginas
├── og.png              # Open Graph (redes sociales)
├── icon.svg, icon-*.png # Favicons
├── _next/static/       # Componentes React pre-compilados (immutable)
│   ├── chunks/         # Código JS minificado
│   ├── css/            # CSS de Tailwind optimizado
│   └── [hash]/         # Assets con contenido-driven hash
└── next.js/font/       # Barlow WebFont (OFL)
```

---

## Verificación local del artefacto

Antes de publicar, verificar que el build se vea correcto:

```bash
npm run serve:out
```

Esto lanza un servidor Node estático en http://localhost:4173:

- Sirve `out/index.html` para rutas sin archivo
- Sirve `out/404.html` para rutas que no existan
- Respeta tipos MIME correctos

**Checklist visual:**

- [ ] Página carga en http://localhost:4173
- [ ] Todos los enlaces funcionan (header, footer, botones CTA)
- [ ] Las imágenes se ven bien
- [ ] El 3D carga (o muestra fallback SVG si no hay WebGL)
- [ ] Sin errores en consola de navegador
- [ ] Responsive: probar en 360, 768, 1920 px de ancho

**Probar en múltiples navegadores:**

```bash
# Servidor sigue corriendo en otro terminal
firefox http://localhost:4173
safari http://localhost:4173 # Si es macOS
# Chrome, Edge, etc.
```

---

## Pruebas y evidencia

Antes de publicar, toda prueba debe pasar y la evidencia debe estar en `docs/evidence/`.

### Suite de pruebas

#### E2E (Playwright)

```bash
npm run test:e2e
```

Corre 4 navegadores (Chromium, Firefox, WebKit, Chrome) contra `out/` construido con dominios de prueba.

**Resultados esperados:**
- 231 pruebas passed / 0 failed / 21 skipped (intencionales: axe y 3D solo en Chromium)
- Specs: content (13 cada uno), links (2), responsive (8), visual (4), interaction (18), resilience (9), a11y (5/2/2/2), three (4/skip/skip/skip)
- Flakiness: 0 (suite ejecutada 2 veces consecutivas debe pasar igual)

Evidencia generada:
- `docs/evidence/screenshots/<navegador>-<ancho>.webp` (16 capturas: 4 navegadores × 4 anchos)
- `docs/evidence/__snapshots__/` (snapshots de regresión visual, Chromium)
- `docs/evidence/axe-*.json` (3 reportes: desktop, móvil, móvil con menú abierto)
- `docs/evidence/link-matrix.md` (matriz de enlaces y referencias internas)
- `docs/evidence/console-3d.json` (errores de consola durante scroll 3D)

#### Tests unitarios

```bash
npm run test:unit
```

Valida las reglas de configuración de release (68 casos):
- Hosts válidos/inválidos (IPv4, IPv6, .local, .internal, .test, .example, single-label)
- URLs con/sin userinfo, path, query, hash, trailing slash
- Emails válidos/inválidos (includes strict regex test)
- E.164 phone numbers

**Resultado esperado**: 68/68 passed

#### Evidencia de rendimiento

```bash
npm run evidence:lighthouse
```

Genera dos reportes (móvil + desktop) contra servidor con gzip en `tests/helpers/serve-gzip.mjs`:

**Resultados esperados** (localhost, gzip, throttling simulado por Lighthouse):
- Móvil: Perf 95, A11y 100, BP 100, SEO 100; LCP 2.9 s, CLS 0, TBT 10 ms
- Desktop: Perf 100, A11y 100, BP 100, SEO 100; LCP 0.8 s, CLS 0, TBT 0 ms

**Nota sobre LCP móvil**: el presupuesto de 2.5 s no se alcanza en simulación local (Lighthouse sobre HTTP/1.1 con throttling). Debe re-medirse en producción (CloudFront con HTTP/2 + brotli compresión real) después del deploy para validar si se cierra la brecha.

Evidencia generada:
- `docs/evidence/lighthouse-mobile-gzip.report.html` (reporte interactivo)
- `docs/evidence/lighthouse-mobile-gzip.report.json` (datos crudos)
- `docs/evidence/lighthouse-desktop-gzip.report.html`
- `docs/evidence/lighthouse-desktop-gzip.report.json`

#### Contraste medido

```bash
npm run evidence:contrast
```

Mide contraste de texto sobre fotografía en escenarios reales:

**Resultado esperado**: `docs/evidence/contrast-hero.md` con mediciones en:
- Hero section (h1 y lead, 1280 y 390 px)
- Contact section (h2, 1280 y 390 px)
- Use case card (tarjeta con imagen de fondo, 1280 y 390 px)

Todos los casos deben cumplir mínimo WCAG AA (4.5:1 para texto normal, 3:1 para texto grande).

### Matriz de navegadores

Documentada en `docs/evidence/browser-matrix.md`:

| Navegador | Versión | Estado | Nota |
|---|---|---|---|
| Chromium | 153.0 | ✅ Completo | 63 passed (incluye axe y 3D) |
| Firefox | 155.0 | ✅ Completo | 56 passed, 7 skipped (axe/3D solo en Chromium) |
| WebKit | 26.6 | ✅ Completo | 56 passed, 7 skipped; WebKit ≠ Safari real |
| Chrome (canal) | 154.0 | ✅ Completo | 56 passed, 7 skipped |
| Safari real | — | ⏳ Smoke manual | Checklist en `browser-matrix.md` |
| Edge | — | ⏳ Smoke manual | No instalado en máquina de tests |

### Resumen en QA-REPORT.md

Todos los resultados, números exactos, detalles de defectos y resoluciones están documentados en `docs/evidence/QA-REPORT.md` (generado al terminar WU4).

---

## Publicación a AWS S3 + CloudFront

### Arquitectura destino

De acuerdo con el Anexo 1 §7 y §11:

```
┌─────────────────────────────────────┐
│  Route 53 (DNS)                     │
│  - apex (m3tric.co)                 │
│  - www (www.m3tric.co)              │
│  → CloudFront distribution (alias)  │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  CloudFront (distribución)          │
│  - ACM certificado (us-east-1)      │
│  - OAC (Origin Access Control)      │
│  - Custom error responses           │
│  - Cache policies by path           │
│  - Response Headers Policy (CSP)    │
└─────────────────────────────────────┘
          ↓
┌─────────────────────────────────────┐
│  S3 Bucket (privado)                │
│  - Block Public Access ON           │
│  - Versioning ON                    │
│  - SSE-S3 encryption                │
│  - Estructura: /                    │
│    ├── index.html                   │
│    ├── 404.html                     │
│    ├── _next/static/ (immutable)    │
│    └── ...                          │
└─────────────────────────────────────┘
```

### Prerequisites

Asumir que:

- AWS CLI está instalado y configurado (`aws configure`)
- Usuario tiene permisos `s3:PutObject`, `s3:DeleteObject`, `cloudfront:CreateInvalidation`
- Bucket S3 existe: `<bucket>` (nombre real a definir)
- CloudFront distribution existe: `<distribution-id>`
- ACM certificado está en `us-east-1` y validado

### Subir a S3

**Paso 1: Sincronizar archivos inmutables (first-time only o actualización)**

Archivos que **no cambian** de nombre o contenido (hash-tagged):

```bash
aws s3 sync out/_next/static/ \
  s3://<bucket>/_next/static/ \
  --cache-control "public, max-age=31536000, immutable" \
  --delete \
  --region us-east-1
```

- `--cache-control` — cache 1 año (31536000 segundos)
- `--delete` — elimina archivos remotos que no existan localmente
- Output esperado: lista de archivos sincronizados + hashes

**Paso 2: Sincronizar assets mutable (imágenes, iconos, manifest)**

Archivos que sí pueden cambiar y queremos cachear un poco menos:

```bash
aws s3 sync out/ \
  s3://<bucket>/ \
  --exclude="_next/static/*" \
  --exclude="*.html" \
  --exclude="*.xml" \
  --exclude="*.txt" \
  --cache-control "public, max-age=86400" \
  --delete \
  --region us-east-1
```

- Excluimos JS/CSS static (ya sincronizado)
- Excluimos HTML/XML/TXT (sincronizar por separado)
- `--cache-control` — cache 24 horas (86400 segundos)

**Paso 3: Sincronizar HTML (cacheable, pero no agresivamente)**

Archivos de contenido que cambian frecuentemente:

```bash
aws s3 sync out/ \
  s3://<bucket>/ \
  --include="*.html" \
  --cache-control "no-cache, must-revalidate" \
  --delete \
  --region us-east-1
```

- `no-cache` — browser puede cachear, pero debe revalidar con el servidor antes de usar
- `must-revalidate` — fuerza revalidación si la copia cacheada es stale

**Paso 4: Sincronizar metadatos (robots, sitemap)**

```bash
aws s3 sync out/ \
  s3://<bucket>/ \
  --include="robots.txt" \
  --include="sitemap.xml" \
  --cache-control "public, max-age=604800" \
  --delete \
  --region us-east-1
```

- `--cache-control` — cache 7 días (604800 segundos)

### Invalidar CloudFront

Después de sincronizar, limpiar el caché de CloudFront para que los usuarios obtengan contenido fresco:

```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*" \
  --region us-east-1
```

**Salida esperada:**

```json
{
  "Invalidation": {
    "Id": "I...",
    "Status": "InProgress",
    "CreateTime": "2026-09-30T...",
    ...
  }
}
```

**Esperar a que se complete:**

```bash
aws cloudfront wait invalidation-completed \
  --distribution-id <distribution-id> \
  --id <invalidation-id> \
  --region us-east-1
```

Tarda 1-10 minutos típicamente.

### Verificación post-deploy

Después de que la invalidación se complete:

**1. Verificar apex y www:**

```bash
curl -I https://m3tric.co/
# HTTP/1.1 200 OK
# Server: CloudFront
# Cache-Control: no-cache, must-revalidate
# Content-Type: text/html
# ...

curl -I https://www.m3tric.co/
# Debe redirigir a apex o servir el mismo contenido
```

**2. Verificar página 404:**

```bash
curl -I https://m3tric.co/nonexistent
# HTTP/1.1 404 Not Found (¡NOT 403 o 502!)
# Content-Type: text/html
# ...
```

**3. Verificar assets estáticos (deben estar cacheados 1 año):**

```bash
curl -I https://m3tric.co/_next/static/chunks/main-abc123.js
# HTTP/1.1 200 OK
# Cache-Control: public, max-age=31536000, immutable
# ETag: "..."
```

**4. Verificar Open Graph (para redes sociales):**

```bash
curl https://m3tric.co/ | grep -i "og:image\|og:title"
# <meta property="og:image" content="https://m3tric.co/og.png">
# <meta property="og:title" content="M3TRIC | Lectura multiescala del territorio">
```

**5. Verificar robots.txt y sitemap.xml:**

```bash
curl https://m3tric.co/robots.txt
# User-agent: *
# Disallow: /_next/
# Sitemap: https://m3tric.co/sitemap.xml

curl https://m3tric.co/sitemap.xml | head -20
# <?xml version="1.0" encoding="UTF-8"?>
# <urlset>
# <url>
#   <loc>https://m3tric.co/</loc>
#   ...
```

**6. Verificar HTTPS y seguridad:**

```bash
# Las cabeceras de seguridad deben venir de CloudFront (Response Headers Policy)
curl -I https://m3tric.co/ | grep -E "Strict-Transport-Security|X-Content-Type-Options|Content-Security-Policy"
```

---

## Cabeceras de seguridad (CloudFront Response Headers Policy)

De acuerdo con §11 de la spec, aplicar estas cabeceras en CloudFront (no en el sitio estático):

**Política de seguridad (nombre sugerido: `M3TRIC-Security-Headers`):**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**Notas:**

- `'unsafe-inline'` en scripts es requerido por el bootstrap inline de Next.js export; está documentado como riesgo aceptado en la spec.
- `img-src 'self' data:` permite imágenes locales + data URIs (inline SVG)
- `connect-src 'self'` previene requests a dominios externos (excepto el mismo origen)
- `frame-ancestors 'none'` previene que la página sea embebida en un iframe

---

## Rollback (reversión)

Si es necesario volver a una versión anterior:

### Opción 1: S3 versioning (si está habilitado)

Si el bucket tiene versionado:

1. **Listar versiones de `index.html`:**

```bash
aws s3api list-object-versions \
  --bucket <bucket> \
  --prefix index.html \
  --region us-east-1 \
  --query 'Versions[0:5].{Key:Key,VersionId:VersionId,LastModified:LastModified}' \
  --output table
```

2. **Restaurar una versión anterior:**

```bash
aws s3api copy-object \
  --bucket <bucket> \
  --copy-source "<bucket>/index.html?versionId=<old-version-id>" \
  --key index.html \
  --cache-control "no-cache, must-revalidate" \
  --region us-east-1
```

3. **Invalidar CloudFront:**

```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*" \
  --region us-east-1
```

### Opción 2: Re-sincronizar un build anterior

Si guardaste un build anterior (p. ej. en Git tags):

1. **Descargar el build anterior:**

```bash
git checkout v2.0.0-1  # Tag de la versión anterior
npm ci && npm run release
```

2. **Sincronizar:**

```bash
aws s3 sync out/ s3://<bucket>/ --delete --region us-east-1
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*" \
  --region us-east-1
```

---

## Troubleshooting

### "HTTP 403 Forbidden" en S3

**Causa**: CloudFront no puede acceder al bucket (falta OAC).

**Solución**:

1. Verificar que el bucket de S3 tiene una bucket policy que permite `s3:GetObject` desde el OAC:

```bash
aws s3api get-bucket-policy --bucket <bucket> --region us-east-1
```

2. La política debe incluir:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket>/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<account-id>:distribution/<distribution-id>"
        }
      }
    }
  ]
}
```

### "Cache purging took too long" o invalidación lenta

**Causa**: CloudFront está ocupado o hay problemas de red.

**Solución**:

```bash
# Esperar más tiempo
aws cloudfront wait invalidation-completed \
  --distribution-id <distribution-id> \
  --id <invalidation-id> \
  --region us-east-1 \
  --max-attempts 360  # Espera hasta 3 horas

# Si sigue fallando, intentar invalidar solo paths críticos
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/index.html" "/404.html" \
  --region us-east-1
```

### "Files uploaded but 404 persists"

**Causa**: CloudFront sirve versión cacheada. Esperar a que expire o invalidar.

**Solución**:

```bash
# Invalidación más agresiva
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*" "/index.html" "/*.html" \
  --region us-east-1

# Verificar que S3 tiene los archivos
aws s3 ls s3://<bucket>/index.html --region us-east-1
aws s3 ls s3://<bucket>/404.html --region us-east-1
```

---

## Procedimiento resumido (checklist)

1. **Build local:**
   ```bash
   npm ci
   cp .env.example .env.production.local
   # Editar .env.production.local con valores aprobados
   npm run check:config
   npm run release
   npm run serve:out
   # Verificar visualmente en http://localhost:4173
   ```

2. **Publicar:**
   ```bash
   # Paso 1: assets estáticos (1 año)
   aws s3 sync out/_next/static/ s3://<bucket>/_next/static/ --cache-control "public, max-age=31536000, immutable" --delete --region us-east-1
   
   # Paso 2: imágenes (24 h)
   aws s3 sync out/ s3://<bucket>/ --exclude="_next/static/*" --exclude="*.html" --exclude="*.xml" --exclude="*.txt" --cache-control "public, max-age=86400" --delete --region us-east-1
   
   # Paso 3: HTML (no-cache)
   aws s3 sync out/ s3://<bucket>/ --include="*.html" --cache-control "no-cache, must-revalidate" --delete --region us-east-1
   
   # Paso 4: metadatos (7 días)
   aws s3 sync out/ s3://<bucket>/ --include="robots.txt" --include="sitemap.xml" --cache-control "public, max-age=604800" --delete --region us-east-1
   ```

3. **Invalidar CloudFront:**
   ```bash
   INVALIDATION_ID=$(aws cloudfront create-invalidation \
     --distribution-id <distribution-id> \
     --paths "/*" \
     --region us-east-1 \
     --query 'Invalidation.Id' \
     --output text)
   
   aws cloudfront wait invalidation-completed \
     --distribution-id <distribution-id> \
     --id $INVALIDATION_ID \
     --region us-east-1
   ```

4. **Verificar:**
   ```bash
   curl -I https://m3tric.co/
   curl -I https://m3tric.co/nonexistent  # Debe ser 404
   curl -I https://www.m3tric.co/
   ```

---

## Referencias

- **Anexo 1 técnico**: Gates G5–G6, §7 (arquitectura), §11 (seguridad)
- **Spec build**: `docs/SPEC-landing-v2.md` §6, §11
- **AWS CLI**: [aws s3 sync](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html), [cloudfront invalidation](https://docs.aws.amazon.com/cli/latest/reference/cloudfront/create-invalidation.html)
