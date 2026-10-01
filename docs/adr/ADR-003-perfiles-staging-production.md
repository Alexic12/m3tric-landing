# ADR-003 — Perfiles `staging` y `production`; correo de contacto opcional en staging

| Campo | Valor |
|---|---|
| Estado | Aceptada |
| Fecha | 2026-10-01 |
| Alcance | `scripts/lib/release-config.mjs`, `src/config/site.ts`, `src/components/sections/Contact.tsx`, `.env.example` |

## Contexto

El gate de release (`npm run release`) es *fail-closed*: exige todas las variables públicas y rechaza dominios de ejemplo o prueba. Hasta ahora todas eran obligatorias, incluido `NEXT_PUBLIC_CONTACT_EMAIL`.

Para publicar en la URL provisional de CloudFront (staging) no existe un correo de contacto aprobado por el cliente (dependencia del cliente n.º 3, `docs/SPEC.md` §16). Inventar uno viola REQ-A01 (sin placeholders) y REQ-A03 (los contactos deben funcionar).

## Decisión

Se introduce un **perfil de release** que decide qué es obligatorio:

| Variable | `production` | `staging` |
|---|---|---|
| `RELEASE_PROFILE` | obligatoria | obligatoria |
| `NEXT_PUBLIC_RELEASE_PROFILE` | debe ser igual a `RELEASE_PROFILE` | debe ser igual a `RELEASE_PROFILE` |
| `NEXT_PUBLIC_SITE_URL` | obligatoria | obligatoria |
| `NEXT_PUBLIC_PLATFORM_URL` | obligatoria | obligatoria |
| `NEXT_PUBLIC_CONTACT_EMAIL` | **obligatoria** | **opcional** |
| `NEXT_PUBLIC_CONTACT_PHONE` | opcional (E.164) | opcional (E.164) |
| `NEXT_PUBLIC_RELEASE_ID` | opcional (`^[A-Za-z0-9._-]{1,64}$`) | opcional |

Reglas adicionales:

- Un correo **presente** se valida siempre (regex estricta, sin dominios de ejemplo), aunque el perfil sea `staging`, porque termina en un enlace `mailto:`.
- Sin correo configurado, la sección Contacto no muestra ningún enlace de correo: muestra «Los canales de contacto se publicarán con el dominio oficial.» y el botón **Abrir plataforma** (nunca un enlace vacío).
- `NEXT_PUBLIC_RELEASE_PROFILE` es el valor que lee la aplicación en build; `RELEASE_PROFILE` lo lee el gate. El gate exige que coincidan.
- Cualquier perfil distinto de `production` se trata como no indexable (ADR-004).

## Alternativas consideradas

1. **Un único perfil con correo obligatorio y un correo de relleno en staging.** Descartada: publica un contacto falso en una URL pública.
2. **Desactivar el gate de correo con un indicador en CI.** Descartada: un interruptor sin nombre ni contrato; el perfil hace explícito qué se relaja y deja trazado el motivo.
3. **Ocultar la sección Contacto en staging.** Descartada: la sección es parte del recorrido (REQ-C05) y su CTA «Hablar con el equipo» ancla a `#contacto`.

## Consecuencias

- El mismo código y el mismo gate sirven para staging y producción; solo cambian las variables.
- En producción la falta de correo sigue bloqueando el release.
- CI ejecuta el gate completo **una vez por perfil** (matriz `staging` y `production` del job `web` de `ci.yml`).
- Hay dos lectores de las reglas (`scripts/lib/release-config.mjs` en Node puro y `src/config/site.ts` en TypeScript); la regex de correo está duplicada a propósito y está documentada en ambos archivos.

## Requisitos relacionados

REQ-A01 · REQ-A03 · REQ-A04 · REQ-C13

## Evidencia

- `scripts/check-config.test.mjs` › «release profiles (ADR-003)»: «staging passes without a contact email», «staging still validates an email that is present», «production without an email fails», «NEXT_PUBLIC_RELEASE_PROFILE must equal RELEASE_PROFILE», «release id is optional but must be a safe token».
- `.github/workflows/ci.yml`, job `web` (matriz de perfiles).
- Bloque de contacto sin correo: `src/components/sections/Contact.tsx` (`contact.pendingChannels`).
- Verificación en vivo del bloque de contacto de staging: Pendiente — se completa con el despliegue.
