# SPEC — Dominio propio `m3tric.io` para la landing y la plataforma

| Campo | Valor |
|---|---|
| Fecha | 2026-11-12 |
| Estado | Aprobado por el owner (decisiones D1–D5); en implementación |
| Alcance | Cuenta EAFIT `914800441297`. Landing (`us-east-2`), plataforma (`us-east-2`), certificado y DNS (`us-east-1` / global) |
| Repos | `Alexic12/m3tric-landing` (este documento, stack de dominio, landing) y `Alexic12/M3TRIC_Platform` (plataforma) |
| ADR | [ADR-013](adr/ADR-013-dominio-m3tric-io.md) |
| Requisito de origen | REQ-A09 (dominio propio, ACM en us-east-1, Route 53, TLS 1.2+), SPEC §10.2 y §16 punto 1 |

## 1. Objetivo

Servir la landing en `https://m3tric.io` y la plataforma en `https://platform.m3tric.io`. Se usa el dominio que EAFIT ya compró en Route 53. Las distribuciones de CloudFront actuales se conservan: solo reciben alias y certificado. No se crean distribuciones, buckets ni APIs.

### Fuera de alcance

- **Indexación** (D3): la landing sigue `noindex` (meta, `robots.txt` y `X-Robots-Tag`). Activarla es un cambio posterior de perfil.
- **Retirar los hosts `*.cloudfront.net`** (D4): siguen funcionando durante la transición. Su retiro o redirección es un cambio posterior con fecha propia.
- Correo del dominio (MX/SPF/DKIM/DMARC), CAA, WAF y DNSSEC. Ver §12.
- La migración Flypark → EAFIT y la finalización de autenticación (A/B). Solo se coordinan con este cambio (§7.4).

## 2. Decisiones del owner (2026-11-12)

| ID | Decisión |
|---|---|
| D1 | Primero el dominio. El change set pendiente `m3tric-auth-A-8cbdf9f9-164f86de` se vuelve obsoleto y se reconstruye después, a partir de la plantilla que ya incluya el dominio (§7.4). |
| D2 | `www.m3tric.io` redirige con 301 a `https://m3tric.io`, conservando ruta y query. |
| D3 | La indexación queda para después: `robotsNoindex` sigue `true` y el perfil de publicación sigue `staging`. |
| D4 | Los hosts `d34991vs3lv2po.cloudfront.net` (landing) y `d3p6d14kqnroeh.cloudfront.net` (plataforma) siguen funcionando durante la transición, incluidos el mapa y la subida de capas. |
| D5 | Antes de desplegar se reemplazan las llaves de acceso del usuario root de EAFIT por un usuario IAM operador (§6.1). |

## 3. Estado verificado (2026-11-12, solo lectura)

| Hecho | Valor |
|---|---|
| Dominio | `m3tric.io` registrado en EAFIT, `ACTIVE`, renovación automática, expira 2027-10-27 |
| Zona | `Z03781402XLYZD0WZKSHK` (pública), solo NS+SOA; delegación del registrador = NS de la zona; DNS público responde con esos NS |
| Certificados ACM us-east-1 | Ninguno |
| Landing | Distribución `E1EXSNY8BIV6RS` (`d34991vs3lv2po.cloudfront.net`), sin alias, certificado por defecto, stack `m3tric-staging-LandingSiteStack` |
| Plataforma | Distribución `E1DE16SLTPQCN0` (`d3p6d14kqnroeh.cloudfront.net`), sin alias, stack `m3tric-staging-PlatformPreviewStack` (`UPDATE_COMPLETE` 2026-11-06 02:59 UTC, 336 recursos) |
| Política del stack de plataforma | Allow `Update:*`; Deny `Update:Replace` y `Update:Delete` |
| Rol de ejecución de la plataforma | `cdk-hnb659fds-cfn-exec-role-914800441297-us-east-2` |
| Plantilla vigente de la plataforma | Objeto privado `cdk-hnb659fds-assets-914800441297-us-east-2/279fe742…6491.json` (312 389 bytes, SSE-KMS); su SHA-256 coincide con su nombre. Es la que aplicó el change set M (`m3tric-auth-M-8cbdf9f9-279fe742`) |
| Change set pendiente | `m3tric-auth-A-8cbdf9f9-164f86de` (`AVAILABLE`, sin ejecutar) |
| Clave de mapas | `m3tric-staging-map-key`, `AllowReferers = [https://d3p6d14kqnroeh.cloudfront.net/*]` |
| CORS del bucket de capas | Un origen: el host CloudFront de la plataforma |
| Cognito | Cliente sin OAuth (`disableOAuth: true`): no hay URLs de callback; el dominio no cambia nada en Cognito |
| Credencial CLI del operador | Se reemplaza por un usuario IAM operador antes de cualquier escritura (D5, §6.1). Los detalles de la cuenta y de las credenciales viven en el registro privado de la sesión, no en este repositorio público |

## 4. Arquitectura objetivo

```
                        Route 53, zona m3tric.io (Z03781402XLYZD0WZKSHK)
   m3tric.io        A/AAAA alias ─┐
   www.m3tric.io    A/AAAA alias ─┼─► CloudFront E1EXSNY8BIV6RS (landing)
                                  │     viewer-request: m3tric-staging-landing-www-redirect
                                  │       host www.m3tric.io → 301 https://m3tric.io<uri>?<qs>
                                  │       cualquier otro host → sin cambio
   platform.m3tric.io A/AAAA alias ─► CloudFront E1DE16SLTPQCN0 (plataforma)

   ACM us-east-1: un certificado (m3tric.io + www.m3tric.io + platform.m3tric.io), validación DNS en la misma zona,
   compartido por ambas distribuciones; SNI; política mínima TLSv1.2_2021.
   Hosts *.cloudfront.net: siguen sirviendo lo mismo (D4).
```

Responsabilidad por stack:

| Stack | Región | Lo despliega | Contiene |
|---|---|---|---|
| `m3tric-DomainStack` (nuevo) | us-east-1 | Una persona, mediante change set revisado y con el usuario operador | Certificado ACM y los 6 registros alias |
| `m3tric-staging-LandingDeliveryIdentityStack` | us-east-2 | Una persona (`cdk deploy`, bootstrap compartido) | Permisos nuevos y acotados del rol `cfn-exec` |
| `m3tric-staging-LandingSiteStack` | us-east-2 | Flujo `deploy.yml` (manual, `eafit-staging`) | Alias, certificado, TLS 1.2 y la función de redirección |
| `m3tric-staging-PlatformPreviewStack` | us-east-2 | Una persona, mediante change set con plantilla parcheada (§6.4.4) | Alias, certificado, TLS 1.2, referers del mapa y CORS de capas |

El DNS vive en un stack aparte porque el plan de la plataforma prohíbe `AWS::Route53` y `AWS::CertificateManager` en su plantilla (`platform-live-plan.yml`, denylist), y el certificado de CloudFront debe estar en us-east-1.

## 5. Requisitos

| ID | Requisito | Criterio de aceptación |
|---|---|---|
| REQ-D01 | `https://m3tric.io/` sirve la landing con certificado válido | `curl -sI https://m3tric.io/` → 200; certificado emitido por Amazon que cubre `m3tric.io`; mismos encabezados de seguridad que el host CloudFront (CSP, HSTS, nosniff, DENY, Referrer, Permissions, `X-Robots-Tag: noindex, nofollow`) |
| REQ-D02 | `www.m3tric.io` redirige a la raíz | `curl -sI 'https://www.m3tric.io/a/b?x=1&y=%20z'` → `301`, `location: https://m3tric.io/a/b?x=1&y=%20z`; sin query → sin `?` |
| REQ-D03 | `https://platform.m3tric.io/login` sirve la plataforma | 200; login real de un usuario de prueba temporal, panel, `/live`, mapa con teselas y reportes en navegador real |
| REQ-D04 | TLS mínimo 1.2 en los hosts propios | `MinimumProtocolVersion = TLSv1.2_2021` en ambas distribuciones; `openssl s_client -tls1_1` contra cada host falla el handshake. Con esto se cierra la supresión cdk-nag `AwsSolutions-CFR4` de la landing |
| REQ-D05 | Los hosts CloudFront actuales siguen funcionando (D4) | Landing 200 en `d34991vs3lv2po…`; plataforma: login, mapa (referer viejo) y preflight CORS de capas desde el origen viejo → 200 con `Access-Control-Allow-Origin` del origen viejo |
| REQ-D06 | El mapa funciona en el host nuevo | `GET https://maps.geo.us-east-2.amazonaws.com/v2/styles/Standard/descriptor?key=…` con `Referer: https://platform.m3tric.io/` → 200 (y 403 con `Referer: https://evil.example/`) |
| REQ-D07 | La subida de capas funciona en el host nuevo | Preflight `OPTIONS` al bucket de capas con `Origin: https://platform.m3tric.io` y `Access-Control-Request-Method: POST` → 200 con ese origen permitido. Un origen ajeno → 403 |
| REQ-D08 | Los enlaces de la landing apuntan al dominio nuevo | `NEXT_PUBLIC_SITE_URL=https://m3tric.io` (canónico, sitemap, OG, JSON-LD) y cada «Abrir plataforma» = `https://platform.m3tric.io/login` (smoke, comprobación 9) |
| REQ-D09 | La indexación no cambia (D3) | Smoke staging en `https://m3tric.io`: meta robots `noindex,nofollow`, `robots.txt` `Disallow: /`, `X-Robots-Tag` presente |
| REQ-D10 | La plataforma cambia solo lo previsto | Change set con exactamente 3 entradas `Modify`, `Replacement: False`, sin `Add`/`Remove`: `PreviewDistributionF5EEDAB8`, `PlatformMapResourcesMapApiKey2C82E674` y `PlatformAdminResourcesOverlaysBucketA3586566`. Después: los mismos 336 IDs físicos y las 23 funciones con el mismo `CodeSha256` |
| REQ-D11 | Mínimo privilegio en la entrega de la landing | `cfn-exec` gana solo lo necesario para una función (nombre exacto) y `acm:DescribeCertificate` (ARN exacto). Sin comodines de recurso, sin `route53:*`, sin otras `Create*` |
| REQ-D12 | El certificado se renueva solo y está protegido | Validación DNS administrada por CloudFormation en la misma zona; política del stack de dominio con Deny `Update:Replace`/`Update:Delete` sobre el certificado; `DeletionPolicy: Retain` en el certificado |
| REQ-D13 | Credenciales sin root (D5) | El perfil CLI usado resuelve al usuario IAM operador; la credencial anterior queda inactiva; el guardarraíl niega `iam:CreateUser` con `AccessDenied` (evidencia privada) |
| REQ-D14 | Trazabilidad | Matriz de `docs/TRACEABILITY.md` actualizada (REQ-A09 → Verificado con evidencia); ADR-013; runbook en `docs/OPERACION.md`; registro en el ledger de migración de la plataforma |

## 6. Diseño por componente

### 6.1 Credenciales del operador (fase 0, D5)

- Todas las escrituras de este cambio se hacen con un usuario IAM operador, solo CLI, nunca con credenciales del root.
- El operador tiene permisos administrativos con guardarraíles explícitos (Deny):
  - crear o modificar identidades y credenciales;
  - quitarse sus propias restricciones;
  - cambios de organización, cuenta o facturación;
  - manipular CloudTrail;
  - escrituras en Identity Center.
- Sigue pudiendo crear roles, porque los stacks los necesitan. Por eso es un guardarraíl contra errores y persistencia, no un límite contra un atacante con la llave. El endurecimiento queda en §12.
- El procedimiento hace lo siguiente:
  1. Crea y prueba el operador.
  2. Cambia el perfil CLI de forma atómica, con respaldo.
  3. Solo entonces desactiva la credencial anterior.
  4. Si falla antes de ese punto, deshace todo lo creado.
- El procedimiento, los identificadores y la evidencia viven fuera de este repositorio público.
- Las herramientas existentes siguen funcionando porque usan el mismo nombre de perfil y validan la cuenta, no la identidad.

### 6.2 Stack de dominio `m3tric-DomainStack` (us-east-1)

**Ubicación:** app CDK aparte en `infra/bin/domain.ts`, con `infra/lib/domain-stack.ts`, `infra/lib/domain-config.ts` e `infra/config/domain-eafit.json`. Es independiente de la app de la landing, de modo que el flujo `deploy.yml` nunca lo sintetiza ni lo despliega.

**Configuración** (`domain-eafit.json`, esquema zod `.strict()`):

```json
{
  "account": "914800441297",
  "region": "us-east-1",
  "hostedZoneId": "Z03781402XLYZD0WZKSHK",
  "zoneName": "m3tric.io",
  "certificateDomains": ["m3tric.io", "www.m3tric.io", "platform.m3tric.io"],
  "aliasRecords": [
    { "name": "m3tric.io", "distributionDomainName": "d34991vs3lv2po.cloudfront.net" },
    { "name": "www.m3tric.io", "distributionDomainName": "d34991vs3lv2po.cloudfront.net" },
    { "name": "platform.m3tric.io", "distributionDomainName": "d3p6d14kqnroeh.cloudfront.net" }
  ],
  "tags": { "Application": "m3tric", "Component": "domain", "Owner": "Alejandro Puerta", "CostCenter": "EAFIT-M3TRIC" }
}
```

Validaciones del esquema:

- `account` es exactamente `914800441297` y `region` es exactamente `us-east-1`.
- `hostedZoneId` cumple `^Z[A-Z0-9]{8,32}$`.
- Cada nombre es un hostname en minúsculas igual a `zoneName` o terminado en `.` + `zoneName`, sin duplicados.
- Cada nombre de `aliasRecords` está en `certificateDomains`.
- `distributionDomainName` cumple `^d[a-z0-9]{12,14}\.cloudfront\.net$`.

**Recursos:**

1. `Certificate` (L2 `aws-certificatemanager.Certificate`):
   - `domainName` = el primero de la lista y `subjectAlternativeNames` = el resto.
   - `validation: CertificateValidation.fromDns(zona importada por atributos)`. Esto emite `DomainValidationOptions` nativos: CloudFormation crea los CNAME de validación y espera a `ISSUED`, sin Lambda.
   - `applyRemovalPolicy(RETAIN)`.
   - Transparencia de certificados habilitada (por defecto).
2. Por cada entrada de `aliasRecords`, un `ARecord` y un `AaaaRecord`, cada uno con `RecordTarget.fromAlias(...)` sobre un `IAliasRecordTarget` mínimo que devuelve el nombre de la distribución y la zona de alias de CloudFront `Z2FDTNDATAQYW2`. Así no se inventan IDs de distribución; la salida es la misma que con `CloudFrontTarget`.
3. Salidas: `CertificateArn` y la lista de nombres.

**Síntesis:**

- Solo plantilla, sin bootstrap. us-east-1 no tiene bootstrap CDK y no lo necesita: se reutiliza el sintetizador `ManualSiteBootstrapSynthesizer` de `landing-app.ts`, exportado.
- Plantilla ≤ 51 200 bytes, para poder pasarla con `--template-body`.
- cdk-nag sin hallazgos pendientes.
- Etiquetas obligatorias en todos los recursos etiquetables.
- `CfnRule` que exige la cuenta `914800441297` y la región `us-east-1`.

**Despliegue (G2):** lo hace una persona con el perfil `EAFIT_Account` (operador).

```bash
cd infra && npx cdk synth --app "npx ts-node --prefer-ts-exts bin/domain.ts" -o cdk.out-domain
aws cloudformation create-change-set --region us-east-1 --profile EAFIT_Account \
  --stack-name m3tric-DomainStack --change-set-name dominio-<sha7> --change-set-type CREATE \
  --template-body file://cdk.out-domain/m3tric-DomainStack.template.json \
  --tags Key=Application,Value=m3tric Key=Component,Value=domain
# inspeccionar: 1 Certificate + 6 RecordSet, todos Add; nada más
aws cloudformation execute-change-set ... && aws cloudformation wait stack-create-complete ...
aws cloudformation set-stack-policy --stack-name m3tric-DomainStack --region us-east-1 --stack-policy-body file://...
```

Política del stack: Allow `Update:*` en todo; Deny `Update:Replace` y `Update:Delete` sobre `LogicalResourceId/<id del certificado>`.

Además, en el mismo paso:

- `aws cloudformation update-termination-protection --enable-termination-protection`. La política del stack no impide `DeleteStack`; `Retain` más la protección de terminación sí.
- Para cerrar G2 hay que comprobar que `get-stack-policy` no está vacío y que `EnableTerminationProtection` es `true`.

Añadir un SAN más adelante reemplaza el certificado: requiere levantar temporalmente la política, con una decisión fechada.

**Orden:** los registros alias se crean **antes** de que las distribuciones tengan los alias. Mientras tanto, el dominio nuevo responde con un error de CloudFront. Es aceptable porque el dominio no tiene tráfico ni está anunciado. Esto permite que el despliegue de la landing publique y haga el smoke directamente sobre `https://m3tric.io`.

**Pruebas** (`infra/test/domain-stack.test.ts`):

- Esquema: válido; claves desconocidas; cuenta o región ajenas; nombre fuera de la zona; alias sin certificado; dominio de distribución inválido.
- Plantilla: exactamente 1 `AWS::CertificateManager::Certificate` (dominio y SAN exactos, validación DNS con la zona, `DeletionPolicy: Retain`) y 6 `AWS::Route53::RecordSet` (A/AAAA por nombre, `AliasTarget.HostedZoneId = Z2FDTNDATAQYW2` y `DNSName` exacto).
- Sin otros tipos, sin `Custom::` ni Lambda.
- Tamaño ≤ 51 200 bytes.
- cdk-nag limpio.

### 6.3 Landing

#### 6.3.1 Configuración (`infra/lib/config.ts`, `infra/config/eafit-staging.json`)

Bloque opcional `customDomain` (`.strict()`):

```json
"customDomain": {
  "apexDomain": "m3tric.io",
  "redirectDomains": ["www.m3tric.io"],
  "certificateArn": "arn:aws:acm:us-east-1:914800441297:certificate/<uuid>"
}
```

Validaciones:

- `certificateArn` cumple `^arn:aws:acm:us-east-1:<account>:certificate/[0-9a-f-]{36}$`, con la cuenta igual a `config.account`.
- Hostnames en minúsculas.
- Cada `redirectDomain` es un subdominio directo de `apexDomain`, sin duplicados.
- `customDomain` solo se admite con `siteCloudFront` presente y nunca con `bootstrapSiteOnly`.

`staging.json` (Flypark) no cambia.

#### 6.3.2 Stack del sitio (`infra/lib/landing-site-stack.ts`)

Con `customDomain` presente, la distribución añade:

- `domainNames: [apex, ...redirectDomains]`;
- `certificate: Certificate.fromCertificateArn(...)`;
- `minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021`;
- `sslSupportMethod: SNI`.

Se quita la supresión `AwsSolutions-CFR4` cuando hay dominio. Sin dominio, la configuración sigue idéntica a la actual: Flypark no cambia.

Con `redirectDomains` no vacío, se añade una `cloudfront.Function`:

- `functionName` = `wwwRedirectFunctionName(env)` = `m3tric-staging-landing-www-redirect` (en `names.ts`);
- runtime `cloudfront-js-2.0`;
- asociada al `defaultBehavior` en `VIEWER_REQUEST`;
- código en línea generado desde la configuración.

Comportamiento de la función:

- `host` = `request.headers.host.value` en minúsculas.
- Si `host` está en `redirectDomains`, responde `301` con:
  - `location: https://<apex><uri><qs>`;
  - `strict-transport-security` igual al de la política (las respuestas generadas por la función no pasan por el origen);
  - `cache-control: max-age=3600`.
- Si no, devuelve `request` sin tocarlo.
- `qs` se reconstruye a partir de `request.querystring`, sin re-codificar, y si está vacío no se añade `?`. Hay tres límites conocidos que no cambian el significado:
  - El orden se conserva por clave: los multivalor agrupan las claves repetidas.
  - `x=` y `x` llegan iguales a la función y salen como `x`.
  - La premisa de que los valores llegan sin decodificar se prueba en G6 con `aws cloudfront test-function` (etapa `DEVELOPMENT`) usando `%20`, `%2B` y un valor vacío, antes del `curl` en vivo.

`SiteUrl` (salida) = `https://<apex>` con dominio, o el host CloudFront sin él.

Pruebas:

- `landing-site-stack.test.ts`: `DistributionConfig` exacto con y sin dominio; tipos de recurso permitidos más `AWS::CloudFront::Function` solo con redirección; salidas.
- La lógica de la función se ejecuta con `node:vm` contra ≥ 10 casos: www con y sin query, multivalor, valor vacío, `%20`, apex sin cambio, host CloudFront sin cambio, mayúsculas en `Host`, ruta raíz.
- `app.test.ts`: clasificación de tipos (Function sin etiquetas si no las admite); quitar la supresión CFR4 esperada cuando hay dominio.

#### 6.3.3 Identidad de entrega (`infra/lib/delivery-identity-stack.ts`)

El rol `cfn-exec` añade, solo con `customDomain` (los permisos de la función, solo si hay redirección; un único predicado exportado por `config.ts` gobierna tanto la función como sus permisos):

- `SiteRedirectFunctionCreate`: `cloudfront:CreateFunction` sobre `*`. La Service Authorization Reference no define ningún tipo de recurso para `CreateFunction`, así que un ARN nunca coincidiría. Es acotado porque asociar una función exige `UpdateDistribution`, que sigue fijado a esta distribución.
- `SiteRedirectFunction`: `cloudfront:DeleteFunction`, `DescribeFunction`, `GetFunction`, `ListTagsForResource`, `PublishFunction`, `TagResource`, `UntagResource` y `UpdateFunction` sobre `arn:aws:cloudfront::<account>:function/m3tric-staging-landing-www-redirect`. Son los handlers create, read, update y delete de `AWS::CloudFront::Function` según `describe-type`.
- `SiteCertificateRead`: `acm:DescribeCertificate` sobre el ARN exacto del certificado.

Decisión documentada en ADR-013: la prueba «sin `cloudfront:Create*`» pasa a permitir **únicamente** `CreateFunction`, y solo en esa sentencia. Las reglas siguen sin `Condition`; el único recurso `*` es el de `CreateFunction`.

El rol de despliegue de GitHub no cambia: CloudFormation ejecuta como `cfn-exec`.

Despliegue: una persona con el operador, `cdk deploy m3tric-staging-LandingDeliveryIdentityStack -c deploymentProfile=eafit-staging -c env=staging -c gitSha=<sha> -c releaseId=<id>`. Antes se revisa `cdk diff`: solo cambia la política en línea de `cfn-exec`.

Pruebas: `delivery-identity-stack.test.ts`, con las sentencias exactas con y sin dominio y la excepción nominal de `CreateFunction`.

#### 6.3.4 Publicación (`scripts/deploy/target.mjs` y su prueba)

- `TARGETS['eafit-staging'].site` pasa a `https://m3tric.io`. Es la única comprobación que fija el host: sin este cambio, `publish.yml` falla en `select`.
- Al lanzar `deploy.yml`, `platform_url` = `https://platform.m3tric.io/login`.

#### 6.3.5 Documentación

- `docs/SPEC.md`: §10.2 TLS y §16 punto 1.
- `docs/TRACEABILITY.md`: REQ-A09 pasa a Verificado con evidencia y se cierra la acción I. La referencia «§16.1», que no existe, se corrige a «§16».
- `infra/README.md`: fila CFR4, dependencia 3 y procedimiento del stack de dominio.
- `docs/OPERACION.md`: dominio, DNS, renovación y reversión.
- `CHANGELOG.md`.
- ADR-013.

### 6.4 Plataforma

#### 6.4.1 Esquema (`infrastructure/cdk/lib/config/platform-preview-schema.ts`)

Bloque opcional de primer nivel `customDomain` (`.strict()`):

```json
"customDomain": { "domainName": "platform.m3tric.io",
                  "certificateArn": "arn:aws:acm:us-east-1:914800441297:certificate/<uuid>" }
```

En `superRefine`:

- el ARN es de ACM en us-east-1 y de la misma cuenta que `config.account`;
- `domainName` es un hostname en minúsculas con al menos dos etiquetas.

Solo `eafit-staging-platform-preview.json` lo lleva; los archivos de Flypark no cambian.

#### 6.4.2 Stack (`platform-preview-stack.ts` y constructos)

Con `customDomain` presente:

- **Distribución:**
  - `domainNames: [domainName]`;
  - `certificate: Certificate.fromCertificateArn(...)`, que crea un import, no un recurso, y por tanto pasa el denylist del plan;
  - `minimumProtocolVersion: TLS_V1_2_2021`;
  - `comment` = `'M3TRIC Platform (platform.m3tric.io); no WAF'`.
- **`PlatformMapResources`:** `allowReferers` = `[https://${distribution.distributionDomainName}/*, https://${domainName}/*]`. Primero el token del host CloudFront, luego el dominio.
- **`PlatformAdminResources`:** una sola regla CORS con `allowedOrigins` = `[https://${distribution.distributionDomainName}, https://${domainName}]`. Nunca `*`.

Sin `customDomain`, la plantilla sintetizada es byte a byte igual a la de `main` (prueba de no regresión para Flypark).

Pruebas (`test/platform-preview-stack.test.ts`, `test/platform-preview-schema.test.ts`):

- La aserción `not.toMatch(/WebACLId|Aliases|ViewerCertificate/)` pasa a ser condicional: sin dominio se mantiene; con dominio exige `Aliases` exacto, `ViewerCertificate` (`AcmCertificateArn`, `sni-only`, `TLSv1.2_2021`) y sigue sin `WebACLId`.
- Referers: dos elementos exactos.
- CORS: una regla, dos orígenes exactos y sin `*`.
- Conteos de tipos sin cambios.
- Esquema: casos positivos y negativos (región, cuenta, formato, clave desconocida).

#### 6.4.3 Por qué no se despliega desde el plan oficial

El stack vivo se ensambló (ceremonia M) con el contexto privado de migración de usuarios: el puente de migración, los hooks de Cognito y `SOURCE_USER_BINDINGS_JSON` con 3 vínculos. El flujo `platform-live-plan.yml` sintetiza **sin** ese contexto. Un change set desde ese plan **quitaría** el puente y los hooks, que es exactamente lo que A/B deben hacer más tarde y de forma controlada. Por eso el cambio de dominio se aplica como **parche mínimo sobre la plantilla vigente**, derivado mecánicamente del diff del código.

#### 6.4.4 Procedimiento de despliegue de la plataforma (G4)

0. **Herramienta.** `domain_patch.py` lleva fijadas en el código las 5 rutas permitidas y exige `--expect-base-sha256` = `279fe742…6491`. Se niega a escribir dentro de un árbol git, porque el candidato contiene los vínculos privados de migración. Escribe sus salidas con modo 0600 y de forma atómica, o no escribe nada.
1. **Delta del código.** Sintetizar `main@antes` (el commit base del PR) y `main@después` (el merge del PR) con contextos idénticos: configuración EAFIT, mismos asset paths, `sourceSha`/`releaseId` fijos e iguales en ambos, sin migración de usuarios. Calcular el diff JSON por recurso. **Debe** contener exactamente:
   - `PreviewDistributionF5EEDAB8.Properties.DistributionConfig.{Aliases, ViewerCertificate, Comment}`;
   - `PlatformMapResourcesMapApiKey2C82E674.Properties.Restrictions.AllowReferers`;
   - `PlatformAdminResourcesOverlaysBucketA3586566.Properties.CorsConfiguration.CorsRules[0].AllowedOrigins`.

   Cualquier otra ruta detiene el proceso.
2. **Base.** Descargar `279fe742…6491.json` y verificar su SHA-256 = nombre. Confirmar con `GetTemplate --template-stage Original` que el stack no ha cambiado desde M (fecha `2026-11-06T02:59:07Z` y `ChangeSetId` de M en `describe-stacks`).
3. **Candidato.** Aplicar a la base exactamente los valores de esas rutas tomados de `main@después`. Comprobar que `candidato` menos `base` = esas rutas y nada más, y que los valores de esas rutas en la base son iguales a los de `main@antes`. Esto prueba que la base y el código coinciden donde se parchea.
4. **Publicación privada.** `PUT` del candidato al bucket de assets CDK como `<sha256>.json` (SSE-KMS por defecto del bucket), con `HEAD` y `GET` de verificación de bytes.
5. **Change set.** Con `--template-url`:
   - `--use-previous-template` no; `--parameters ParameterKey=BootstrapVersion,UsePreviousValue=true`;
   - `--capabilities CAPABILITY_AUTO_EXPAND CAPABILITY_IAM CAPABILITY_NAMED_IAM`;
   - `--role-arn` = el rol actual del stack;
   - nombre `dominio-platform-<sha7>`.
6. **Inspección.** Lista paginada completa. Exactamente las 3 entradas de REQ-D10 (`Modify`, `Replacement: False`, `Scope` solo `Properties`) y ninguna otra. Se admiten reevaluaciones `Dynamic` de dependientes **solo** si `describe-change-set` las lista dentro de esas 3. Si aparece cualquier otra, se detiene y se elimina el change set.
7. **Ejecución** y espera de `UPDATE_COMPLETE`. La ejecución elimina el change set A pendiente (D1).
8. **Comprobación posterior:**
   - 336 recursos con los mismos IDs físicos;
   - 23 funciones con el mismo `CodeSha256`;
   - la distribución tiene `Aliases`, el certificado y `TLSv1.2_2021`;
   - la clave de mapas tiene los 2 referers;
   - CORS del bucket con 2 orígenes;
   - el pool de Cognito, sus `LambdaConfig` y los 3 usuarios sin cambios.

Ejecuta: el Tech Lead, con un script revisado (`infrastructure/account-migration/domain_patch.py` en la plataforma, con pruebas `test_domain_patch.py` sobre plantillas sintéticas; el plan oficial ya corre las pruebas de ese directorio). El script es solo de lectura y cálculo. Las escrituras (`PUT`, `create-change-set`, `execute`) son comandos separados que se revisan antes de ejecutarse.

#### 6.4.5 Documentación de la plataforma

- `docs/aws-deployment/08-dominio-platform-m3tric-io.md`: resumen, enlace a este SPEC y procedimiento §6.4.4.
- Entrada en `docs/aws-deployment/05-flypark-eafit-migration.md` §9 con la regla de §7.4.

## 7. Secuencia de ejecución y puertas

| Puerta | Acción | Entrada | Salida / evidencia | Reversión |
|---|---|---|---|---|
| G0 | Reemplazo de llaves root (§6.1) | Aprobación del owner | REQ-D13; salida del script | Reactivar la llave root desde la consola del root |
| G1 | PRs de código | Este SPEC | CI verde en ambos repos; revisión de código; se fusionan primero el PR de dominio y SPEC de la landing y luego, tras G2, los de landing y plataforma con el ARN | Revertir los PR |
| G2 | Stack de dominio | G0 y el PR de dominio fusionado | `CREATE_COMPLETE`, certificado `ISSUED`, 6 registros, política del stack aplicada | Borrar los registros (el certificado se retiene) |
| G3 | Fijar el ARN en las configs y fusionar los PRs de landing y plataforma | G2 | CI verde | Revertir los PR |
| G4 | Plataforma (§6.4.4) | G3 | REQ-D10; `curl` pasa por `platform.m3tric.io` | Change set inverso desde la plantilla base `279fe742…` (sin dominio) |
| G5 | Identidad de la landing | G3 | `cdk diff` solo de la política; `UPDATE_COMPLETE` | Redesplegar desde el commit previo |
| G6 | Landing (`deploy.yml` → `eafit-staging`, `platform_url=https://platform.m3tric.io/login`) | G4 y G5 | Infra y smoke verdes sobre `https://m3tric.io`; REQ-D01, D02, D08, D09 | `deploy.yml` desde el commit previo, o quitar `customDomain` |
| G7 | QA en navegador real con gestos reales | G6 | REQ-D03 a D07; capturas en `docs/evidence/dominio/` | — |
| G8 | Documentación, ledger y memoria | G7 | REQ-D14; PRs de documentación | — |

### 7.1 Reglas de las puertas

- Ninguna escritura en AWS sin la puerta anterior cerrada y su evidencia guardada.
- Un fallo detiene y diagnostica; no se reintenta a ciegas.
- Cada change set se inspecciona completo antes de ejecutarse.

### 7.2 Usuario de prueba

La QA de la plataforma usa un usuario temporal `smoke-dominio-<rand>`:

- se crea en el pool EAFIT con el grupo `visualizacion`, contraseña generada en memoria y nunca impresa;
- se verifica el `Username` devuelto;
- se borra al final.

No se usa `metric_user` ni se toca a los dos usuarios diferidos.

### 7.3 Prueba de capas sin alterar datos

REQ-D07 se verifica por preflight CORS (`OPTIONS`), sin subir objetos.

### 7.4 Coordinación con la migración (D1)

- La ejecución de G4 elimina el change set pendiente `m3tric-auth-A-8cbdf9f9-164f86de`.
- **Regla permanente:** cualquier plantilla futura de la ceremonia de autenticación (A, B o una corrección) se construye desde la plantilla que dejó G4, base `279fe742…` más el delta de dominio. **Nunca** desde `279fe742…` ni desde `164f86de…`, porque revertirían el dominio.
- La comprobación previa de esas ceremonias debe exigir los 3 valores de dominio intactos.
- Esta regla se registra en el ledger de migración.

## 8. Verificación (comandos de referencia)

```bash
dig +short m3tric.io A; dig +short m3tric.io AAAA; dig +short platform.m3tric.io A; dig +short www.m3tric.io A
curl -sI https://m3tric.io/ ; curl -sI 'https://www.m3tric.io/a?x=1' ; curl -sI https://platform.m3tric.io/login
openssl s_client -connect m3tric.io:443 -servername m3tric.io -tls1_1 </dev/null   # debe fallar
openssl s_client -connect m3tric.io:443 -servername m3tric.io -tls1_2 </dev/null | openssl x509 -noout -subject -ext subjectAltName
curl -s -o /dev/null -w '%{http_code}' -H 'Referer: https://platform.m3tric.io/' "https://maps.geo.us-east-2.amazonaws.com/v2/styles/Standard/descriptor?key=<key>"
curl -s -o /dev/null -w '%{http_code}' -X OPTIONS -H 'Origin: https://platform.m3tric.io' -H 'Access-Control-Request-Method: POST' https://<overlays-bucket>.s3.us-east-2.amazonaws.com/
SITE_URL=https://m3tric.io PLATFORM_URL=https://platform.m3tric.io/login EXPECT_PROFILE=staging node scripts/deploy/smoke.mjs
```

Navegador real (Chrome) en `https://platform.m3tric.io` con el usuario temporal:

- login;
- cerrar el tutorial;
- panel;
- `/live`;
- mapa: medir la cadena de `getBoundingClientRect` y la diversidad de colores de la captura del elemento, sin leer píxeles de WebGL;
- reportes.

En el host CloudFront viejo, lo mismo para el login y el mapa.

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Un change set de plataforma desde el plan oficial quitaría el puente de migración | Prohibido; despliegue por parche derivado del diff (§6.4.3 y §6.4.4) |
| Una ceremonia de autenticación futura revierte el dominio | Regla de §7.4 en el ledger y en la comprobación previa |
| El mapa queda en blanco en un host | Ambos referers; REQ-D06 se prueba con `curl` y en el navegador |
| Falla la subida de capas en un host | Ambos orígenes CORS; REQ-D07 |
| Falta un permiso en `cfn-exec` y la landing hace rollback | Permisos tomados de `describe-type`; `acm:DescribeCertificate` preventivo; el rollback de CloudFormation deja el estado anterior |
| `publish.yml` falla en `select` por el host fijo | §6.3.4 |
| El certificado no valida | La zona está en la misma cuenta y CloudFormation crea los CNAME. Si tarda más de 30 min, se diagnostica con `describe-certificate` sin borrar nada |
| Se borra el certificado en uso | `Retain` más la política del stack |
| Sesiones por origen: los usuarios inician sesión otra vez en el host nuevo y el tutorial puede reaparecer | Esperado; se comunica al owner |
| Llave root expuesta | G0 antes de cualquier escritura |
| Desfase entre el código y la plantilla viva de la plataforma (`GitSha` 8cb + delta) | Se documenta en el ledger: la plantilla viva es «M + delta de dominio (commit X)» |

## 10. Reversión

- **Rápida (DNS):** borrar los registros alias del stack de dominio. Los hosts CloudFront siguen intactos.
- **Landing:** `deploy.yml` desde el commit anterior. La distribución pierde los alias y la función queda huérfana o se borra.
- **Plataforma:** change set con la plantilla base `279fe742…`. Deja 3 `Modify` de vuelta, inspeccionados igual.
- **Credenciales:** el root reactiva su llave desde la consola. No hace falta mientras el operador funcione.

## 11. Trazabilidad

| Requisito | Implementación | Prueba / evidencia |
|---|---|---|
| REQ-D01, D04, D09 | §6.3.2 | `landing-site-stack.test.ts`; smoke en vivo; `openssl` |
| REQ-D02 | §6.3.2 (función) | Pruebas `node:vm` de la función; `curl` en vivo |
| REQ-D03, D06, D07, D10 | §6.4 | `platform-preview-*.test.ts`; inspección y comprobación posterior; navegador |
| REQ-D05 | §6.4.2 (dos orígenes) | `curl` y navegador en el host viejo |
| REQ-D08 | §6.3.4 | Smoke comprobaciones 7 y 9 |
| REQ-D11 | §6.3.3 | `delivery-identity-stack.test.ts` |
| REQ-D12 | §6.2 | `domain-stack.test.ts`; `get-stack-policy` |
| REQ-D13 | §6.1 | Salida del script; `sts get-caller-identity` |
| REQ-D14 | §6.3.5 y §6.4.5 | PRs de documentación |

## 12. Pendientes posteriores (fuera de este cambio)

1. Indexación: perfil `production`, `robotsNoindex: false`, sitemap y Lighthouse con el perfil production (D3).
2. Fecha de retiro o redirección de los hosts `*.cloudfront.net` (D4).
3. Borrar la llave root cuando lleve una semana inactiva sin incidentes.
4. Endurecer el operador: rol administrador con MFA asumido desde un usuario sin permisos, o Identity Center desde la organización.
5. Higiene DNS sin correo: `CAA 0 issue "amazon.com"`, `TXT "v=spf1 -all"` y `_dmarc` con `p=reject`.
6. Documentación obsoleta detectada (sin tocar aquí): `docs/OPERACION.md` §6, `docs/SPEC.md` §11.2 e `infra/README.md` describen un despliegue automático en push a `main` que ya no existe. `rollback.yml` no tiene ruta EAFIT.
7. Alarma de CloudWatch sobre `AWS/CertificateManager` `DaysToExpiry` del certificado, por si la renovación administrada falla en silencio.
8. HSTS: la landing envía `includeSubDomains` desde el apex (2 años). Todo subdominio futuro de `m3tric.io` debe servirse con HTTPS y certificado válido. Nunca añadir `preload` sin decisión explícita.
