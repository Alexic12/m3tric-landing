# ADR-013 — Dominio propio `m3tric.io` para la landing y la plataforma

| Campo | Valor |
|---|---|
| Estado | Aceptada (2026-11-12) |
| Fecha | 2026-11-12 |
| Decisor | Owner (decisiones D1–D5 del 2026-11-12, `docs/SPEC-DOMINIO.md` §2) |
| Alcance | Landing (`infra/lib/landing-site-stack.ts`, `infra/lib/delivery-identity-stack.ts`, `infra/config/`); stack de dominio nuevo (`infra/bin/domain.ts`, `infra/lib/domain-stack.ts`); plataforma (repositorio `M3TRIC_Platform`, `infrastructure/cdk/`) |
| Requisitos | REQ-A09 (origen) · REQ-D01 a REQ-D14 (`docs/SPEC-DOMINIO.md` §5) |

## Contexto

La landing y la plataforma se sirven solo desde hosts `*.cloudfront.net` sin alias y con el certificado por defecto. REQ-A09 exige dominio propio, certificado ACM en us-east-1 y TLS 1.2 o superior. EAFIT ya tiene `m3tric.io` registrado y una zona pública en Route 53 (`Z03781402XLYZD0WZKSHK`), sin registros de servicio. No existe ningún certificado ACM en us-east-1.

Dos restricciones condicionan el diseño:

- El plan oficial de la plataforma (`platform-live-plan.yml`) prohíbe `AWS::Route53` y `AWS::CertificateManager` en su plantilla.
- CloudFront solo acepta certificados de us-east-1, y el flujo de GitHub de la landing no debe tocar DNS.

Además, el stack vivo de la plataforma se ensambló con el contexto privado de migración de usuarios (puente de migración, hooks de Cognito). Un change set desde el plan oficial quitaría esos elementos.

## Decisión

1. **Dominios.** La landing sirve `https://m3tric.io` y la plataforma `https://platform.m3tric.io`, sobre las distribuciones CloudFront existentes (`E1EXSNY8BIV6RS` y `E1DE16SLTPQCN0`). Solo se añaden alias y certificado: no se crean distribuciones, buckets ni APIs. Un único certificado ACM en us-east-1 con validación DNS cubre `m3tric.io`, `www.m3tric.io` y `platform.m3tric.io`, y lo comparten ambas distribuciones. Política mínima `TLSv1.2_2021`. Este cambio cierra REQ-A09 y la supresión `AwsSolutions-CFR4` de la landing.

2. **Stack de dominio aparte.** El certificado y los seis registros alias (A y AAAA por cada uno de los tres nombres) viven en `m3tric-DomainStack`, en us-east-1. Lo despliega una persona con el usuario operador, mediante change set inspeccionado antes de ejecutarse. El flujo `deploy.yml` nunca sintetiza ni despliega este stack.

3. **Redirección de `www` a la raíz.** Una CloudFront Function (`m3tric-staging-landing-www-redirect`, `cloudfront-js-2.0`, `VIEWER_REQUEST`) responde 301 a `https://m3tric.io` conservando ruta y query. Esto es una excepción acotada a la regla de ADR-002 («el rol `cfn-exec` no crea recursos de CloudFront»). Se añaden solo:
   - `cloudfront:CreateFunction` sobre `*`. Es la única forma posible: la Service Authorization Reference no define tipo de recurso para esa acción.
   - `DeleteFunction`, `DescribeFunction`, `GetFunction`, `ListTagsForResource`, `PublishFunction`, `TagResource`, `UntagResource` y `UpdateFunction` sobre el ARN exacto de esa función. Es lo que listan los handlers de CloudFormation.
   - `acm:DescribeCertificate` sobre el ARN exacto del certificado.

   Es aceptable por tres motivos:
   - Una función creada no puede asociarse a nada, porque `UpdateDistribution` sigue fijado a la distribución de la landing.
   - La función no accede a datos ni a objetos.
   - Las reglas no tienen `Condition`. Alternativa descartada: un bucket S3 de redirección con una segunda distribución, que añade recursos y costo sin beneficio.

4. **Hosts `*.cloudfront.net` activos (D4).** Siguen sirviendo durante la transición, por decisión del owner. Por eso la clave de mapas (`m3tric-staging-map-key`) lleva los referers de ambos hosts, y el CORS del bucket de capas admite ambos orígenes. Nunca `*`.

5. **Plataforma con parche mínimo.** Mientras dure la migración de autenticación, la plataforma se despliega como parche mínimo sobre la plantilla viva (base `279fe742…`, M), no desde el plan oficial. El parche cambia exactamente tres propiedades (`Aliases`/`ViewerCertificate`/`Comment` de la distribución, `AllowReferers` de la clave de mapas y `AllowedOrigins` del CORS). Toda plantilla futura de la ceremonia de autenticación se construye sobre M más el delta de dominio (SPEC §7.4).

6. **Indexación apagada (D3).** `robotsNoindex` sigue en `true` y el perfil de publicación sigue en `staging`. ADR-004 sigue vigente.

## Alternativas consideradas

1. **Certificado y DNS dentro del stack de la plataforma.** Descartada: el plan oficial lo prohíbe, y el certificado de CloudFront debe estar en us-east-1, distinto de la región de la plataforma.
2. **Certificado y DNS dentro del flujo de GitHub de la landing.** Descartada: pondría Route 53 y ACM en la cadena de un token OIDC de CI, y obligaría a conceder permisos de DNS al rol de despliegue.
3. **Redirección `www` con bucket S3 y segunda distribución.** Descartada: más recursos, más costo y otra distribución que mantener, frente a una función sin costo de infraestructura.
4. **Parche de la plataforma desde el plan oficial.** Descartada: quitaría el puente de migración y los hooks de Cognito del stack vivo.
5. **Retirar los hosts `*.cloudfront.net` al mismo tiempo.** Descartada: rompe el mapa y la subida de capas en curso. Su retiro tiene fecha propia (D4).

## Consecuencias

**Positivas**

- Una sola cadena de certificado y un solo stack de DNS, auditables y con política de stack que impide reemplazar o borrar el certificado (`Retain`).
- La landing y la plataforma quedan en TLS 1.2 o superior, y la supresión CFR4 desaparece.
- El flujo de GitHub sigue sin tocar DNS ni IAM.

**Negativas y costos aceptados**

- **Sesión por origen.** Los usuarios de la plataforma vuelven a iniciar sesión en `platform.m3tric.io`, y el tutorial puede reaparecer. Es esperado y se comunica al owner.
- **Plantilla viva = M + delta.** La plantilla de la plataforma no coincide con ningún commit de `main`. Cualquier ceremonia futura que parta de otra base revertiría el dominio. La comprobación previa debe exigir los tres valores de dominio intactos.
- **Excepción IAM en `cfn-exec`.** `cloudfront:CreateFunction` es la única acción de creación de CloudFront en ese rol. Una función nueva con otro nombre o un cambio que requiera permisos adicionales fallará con `AccessDenied` hasta que una persona amplíe el rol en el stack de identidad.
- **Un certificado con validación DNS.** Si la validación tarda más de 30 minutos, se diagnostica con `describe-certificate` sin borrar nada.
- **Dos hosts activos.** Mientras dure D4, cualquier cambio en la clave de mapas o en el CORS debe mantener ambos orígenes.
- **HSTS con `includeSubDomains` en un apex real.** La política de la landing obliga a usar HTTPS en cada `*.m3tric.io` durante 2 años, en cada navegador que la visite. Todo subdominio futuro debe tener certificado y HTTPS. `preload` queda prohibido sin decisión explícita.
- **Ventana sin dominio resuelto.** Entre la creación de los registros y la asociación de alias en las distribuciones, el dominio nuevo responde con error de CloudFront. Es aceptable porque no tiene tráfico ni está anunciado.

## Referencias

- `docs/SPEC-DOMINIO.md` (§1 objetivo, §2 decisiones D1–D5, §4 arquitectura, §6.2 stack de dominio, §6.3.3 identidad de entrega, §6.4.3 por qué no se despliega desde el plan oficial, §7.4 coordinación con la migración, §12 pendientes).
- REQ-A09 (dominio propio, ACM en us-east-1, Route 53, TLS 1.2 o superior).
- ADR-002 (app CDK propia e identidad OIDC): origen de la regla que esta decisión exceptúa.
- ADR-004 (`noindex` en staging): sigue vigente tras este cambio.
