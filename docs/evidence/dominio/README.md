# Evidencia del dominio m3tric.io (2026-11-12)

Evidencia del despliegue del dominio propio para la landing y la plataforma (`docs/SPEC-DOMINIO.md`, ADR-013).
El resumen por puerta está en `docs/SPEC-DOMINIO.md` §13; el estado del requisito, en `docs/TRACEABILITY.md` (REQ-A09).

Esta carpeta no contiene credenciales, claves de API, nombres de usuario ni datos de cuentas. Las claves del
mapa y los tokens se omiten en los comandos.

## Capturas (puerta G7, QA en navegador sin sesión)

| Archivo | Qué muestra |
|---|---|
| `platform-m3tric-io-login.png` | Pantalla de acceso de la plataforma servida en `https://platform.m3tric.io/login`, sin sesión iniciada. |
| `platform-cloudfront-legacy-login.png` | Pantalla de acceso de la plataforma servida en el host antiguo `*.cloudfront.net`, sin sesión iniciada (D4). |

Las capturas muestran solo el formulario vacío. La QA con sesión iniciada no está en esta carpeta: queda pendiente
de una ejecución del owner con su cuenta.

## Comprobaciones en vivo (2026-11-12)

### Landing, certificado y redirección (`curl`, `openssl`)

```bash
curl -sI https://m3tric.io/
curl -sI 'https://www.m3tric.io/a/b?x=1&y=%20z&flag'
openssl s_client -connect m3tric.io:443 -servername m3tric.io -tls1_1 </dev/null     # debe fallar
```

| Comprobación | Resultado |
|---|---|
| `https://m3tric.io/` | 200. Cabeceras: CSP, `Strict-Transport-Security: max-age=63072000; includeSubDomains`, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` y `X-Robots-Tag: noindex, nofollow`. |
| Meta robots y `robots.txt` | `noindex,nofollow` y `Disallow: /` (D3: la indexación no cambia). Canonical `https://m3tric.io`. |
| `https://www.m3tric.io/a/b?x=1&y=%20z&flag` | 301 con `location: https://m3tric.io/a/b?y=%20z&x=1&flag`. Los valores llegan sin decodificar (`%20` se conserva); el orden entre claves distintas cambia, y el significado de la query no. |
| `openssl s_client -tls1_1` contra `m3tric.io`, `www.m3tric.io` y `platform.m3tric.io` | Handshake rechazado (alerta de versión de protocolo) en los tres hosts. |
| Certificado servido | Cubre `m3tric.io`, `platform.m3tric.io` y `www.m3tric.io`. |
| DNS público | `m3tric.io`, `www.m3tric.io` y `platform.m3tric.io` resuelven a registros A. |
| Hosts antiguos (D4) | `https://d34991vs3lv2po.cloudfront.net/` → 200; `https://d3p6d14kqnroeh.cloudfront.net/login` → 200. |

### Plataforma

| Comprobación | Resultado |
|---|---|
| `https://platform.m3tric.io/login`, `/auth-config.json`, `/map-config.json` | 200 en los tres. |
| `https://platform.m3tric.io/api/live/overview` sin token | 400, por diseño. |
| Navegador real (Chrome) en los dos hosts: `/map` sin sesión | Redirige a `/login` y muestra el formulario; 0 errores de consola y 0 peticiones fallidas, en ambos hosts. |

### Teselas del mapa (REQ-D06)

Se mide sobre las teselas (`GET https://maps.geo.us-east-2.amazonaws.com/v2/tiles/...?key=…`). El descriptor de
estilo no sirve para esta prueba: responde 200 con cualquier referer (comportamiento de AWS, preexistente).

| `Referer` | Resultado |
|---|---|
| `https://platform.m3tric.io/` | 200 |
| `https://d3p6d14kqnroeh.cloudfront.net/` | 200 |
| `https://m3tric.io/` | 403 |
| `https://platform.m3tric.io.evil.example/` | 403 |
| (sin `Referer`) | 403 |

### Subida de capas: preflight CORS (REQ-D07)

Se mide con `OPTIONS` y `Access-Control-Request-Method: POST`, sin subir objetos.

| `Origin` | Resultado |
|---|---|
| `https://platform.m3tric.io` | 200; `Access-Control-Allow-Origin` devuelve ese origen. |
| `https://d3p6d14kqnroeh.cloudfront.net` | 200; `Access-Control-Allow-Origin` devuelve ese origen. |
| `https://evil.example` | 403. |

## Despliegue

- `deploy.yml`, run `43269436122`: `eafit-staging`, `platform_url=https://platform.m3tric.io/login`, release
  `deploy-18-136224d`. Éxito en todos los jobs, incluidos el deploy de CDK y la publicación con smoke sobre
  `https://m3tric.io`.
- Stack de dominio `m3tric-DomainStack` (us-east-1): `CREATE_COMPLETE` con 1 `Certificate` y 6 `RecordSet`, todos
  `Add`. El certificado está `ISSUED`, con validación DNS correcta en los tres nombres (3 de 3) y `NotAfter`
  2027-05-29. `RenewalEligibility` era `INELIGIBLE` antes de que CloudFront lo usara (esperado: pasa a elegible al
  estar en uso).
- Plataforma: change set de 3 modificaciones directas en `UPDATE_COMPLETE`. Tras la ejecución, 336/336 IDs físicos
  iguales y 23/23 funciones con el mismo `CodeSha256`.

## Pendiente

- QA en navegador con sesión iniciada en `platform.m3tric.io`, por una ejecución del owner con su cuenta.
- Lighthouse y suite en vivo con el perfil production (`docs/TRACEABILITY.md`, acción I).
- Indexación (D3) y retiro de los hosts `*.cloudfront.net` (D4): `docs/SPEC-DOMINIO.md` §12.
