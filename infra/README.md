# Infraestructura de la landing M3TRIC (AWS CDK v2)

App CDK en TypeScript que crea la infraestructura de la landing estática en la cuenta
`147997127433`, región `us-east-2` (CloudFront es global). Implementa `docs/SPEC.md` §10
y es la que consumen los workflows de §11.

Versiones fijadas (alineadas con `M3TRIC_Platform/infrastructure/cdk`): Node `24.19.0`
(`.node-version`, `engine-strict`), `aws-cdk-lib 2.267.0`, CLI `aws-cdk 2.1138.0`,
`constructs 10.8.1`, `cdk-nag 3.0.2`, `zod 4.4.3`, `vitest 4.1.11`, `typescript 5.9.3`.

## Estructura

| Ruta | Qué es |
|---|---|
| `bin/landing.ts` | Punto de entrada: lee el contexto, carga la configuración, arma la app y registra cdk-nag. |
| `lib/config.ts` | Esquema zod de `config/<env>.json` y del contexto `env` / `gitSha` / `releaseId`; etiquetas obligatorias. |
| `lib/names.ts` | Nombres físicos compartidos (stacks, rol, política, presupuesto, tema). |
| `lib/landing-app.ts` | Construye los dos stacks con etiquetas, sintetizador y nombres. La usan `bin` y las pruebas. |
| `lib/delivery-identity-stack.ts` | `m3tric-staging-LandingDeliveryIdentityStack`. |
| `lib/landing-site-stack.ts` | `m3tric-staging-LandingSiteStack`. |
| `config/staging.json` | Valores de staging (no secretos). |
| `test/*.test.ts` | Pruebas vitest sobre las plantillas sintetizadas + cdk-nag. |

## Comandos

```bash
cd infra
npm ci
npm run typecheck   # tsc sobre bin/lib y sobre las pruebas
npm run lint        # eslint, cero advertencias
npm test            # vitest: plantillas exactas + cdk-nag
npm run synth       # cdk synth con env=staging y gitSha/releaseId de prueba
```

`npx cdk ...` usa siempre el CLI local (`devDependency`). El contexto `gitSha` (40 hex en
minúsculas) y `releaseId` (`^[A-Za-z0-9][A-Za-z0-9._-]{2,127}$`) son **obligatorios**: sin
ellos la síntesis falla, porque todas las etiquetas los llevan. `env` es `staging` por defecto.

## Qué crea cada stack

### `m3tric-staging-LandingDeliveryIdentityStack` (lo despliega una persona, una vez)

- **Importa** (no crea) el proveedor OIDC existente
  `arn:aws:iam::147997127433:oidc-provider/token.actions.githubusercontent.com`.
- Rol `m3tric-staging-landing-github-deploy`, path `/m3tric/delivery/`, sesión máxima 1 h.
  - Confianza: `sts:AssumeRoleWithWebIdentity` con `StringEquals` exacto
    `aud = sts.amazonaws.com` y `sub = repo:Alexic12/m3tric-landing:environment:landing-staging`
    (ni ramas, ni PRs, ni forks, ni comodines).
  - Política en línea `LandingCdkDelivery`: `sts:AssumeRole` sobre
    `cdk-hnb659fds-{deploy,file-publishing,lookup}-role-147997127433-us-east-2` y
    `cloudformation:DescribeStacks` sobre `stack/m3tric-staging-LandingSiteStack/*`.
- Salida `RoleArn`. Protección de terminación activada.

### `m3tric-staging-LandingSiteStack` (lo despliega GitHub Actions)

- **SiteBucket**: BPA total, SSE-S3, versionado, `enforceSSL`, `BucketOwnerEnforced`,
  versiones no actuales expiran a los 90 días, logs de acceso al LogsBucket (`s3-access/`), RETAIN.
- **LogsBucket**: BPA total, SSE-S3, `enforceSSL`, `BucketOwnerPreferred` (lo exigen los logs
  estándar de CloudFront, que escriben por ACL), expiración a 90 días, RETAIN.
- **Distribution**: origen S3 con **OAC** (sin OAI), `index.html` como raíz, HTTP/2 y HTTP/3,
  `redirect-to-https`, `PriceClass_100`, compresión, `CachingOptimized`, errores 403 y 404 →
  `/404.html` con estado 404 (TTL 60 s), logs estándar en `LogsBucket/cloudfront/`.
- **ResponseHeadersPolicy** `m3tric-staging-landing-security-headers`: CSP, HSTS
  (`max-age=63072000; includeSubDomains`), `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y, solo si
  `robotsNoindex` es `true` (staging, ADR-004), `X-Robots-Tag: noindex, nofollow`. Todas con
  `override`, así que prevalecen sobre lo que devuelva el origen.
- **Política de publicación** `m3tric-staging-landing-publish` (`AWS::IAM::Policy` adjunta **por
  nombre** al rol del stack de identidad): `s3:ListBucket` en el bucket;
  `s3:GetObject/PutObject/DeleteObject` en `bucket/*`; `cloudfront:CreateInvalidation/GetInvalidation`
  en el ARN de la distribución. Nada más.
- **Presupuesto** `m3tric-staging-landing-monthly`: USD 10/mes, tipo COST, filtrado por
  `user:Component$landing`; aviso cuando el gasto **real** supera el 80 % → tema SNS
  `m3tric-staging-landing-budget-alerts` (solo publica Budgets, solo por TLS; **sin suscripción**).
- **Salidas**: `SiteBucketName`, `DistributionId`, `DistributionDomainName`, `SiteUrl`
  (`https://<dominio>`), `PublishRoleName`.

El stack del sitio **no depende** del de identidad en el despliegue: solo usa el *nombre* del
rol (un literal, sin `Fn::ImportValue`). Un chequeo en síntesis verifica que ese nombre coincide
con el de `lib/names.ts`, que es el que usa el stack de identidad.

## Bootstrap único del stack de identidad

Requisitos: credenciales humanas locales con permisos de administración en la cuenta (perfil
`flypark`), y el bootstrap de CDK existente (qualifier `hnb659fds`, versión 31; la plantilla
exige ≥ 6).

1. Revisar lo que se va a crear:

   ```bash
   cd infra && npm ci && npm test
   AWS_PROFILE=flypark npx cdk diff m3tric-staging-LandingDeliveryIdentityStack \
     -c env=staging -c gitSha=$(git rev-parse HEAD) -c releaseId=identity-$(date +%Y%m%d)
   ```

2. Desplegar (comando exacto):

   ```bash
   AWS_PROFILE=flypark npx cdk deploy m3tric-staging-LandingDeliveryIdentityStack -c env=staging -c gitSha=$(git rev-parse HEAD) -c releaseId=identity-<date>
   ```

   con `<date>` en formato `YYYYMMDD` (p. ej. `identity-20261001`). CDK pedirá confirmar los
   cambios de IAM: revisarlos contra §10.1 antes de aceptar.

3. Copiar la salida `RoleArn` como **variable** (no secreto) del environment `landing-staging`
   de GitHub; el workflow la pasa a `aws-actions/configure-aws-credentials` (`role-to-assume`).

Debe desplegarse **antes** del primer run del workflow: la política de publicación del stack del
sitio se adjunta a este rol por nombre y CloudFormation falla si el rol no existe.

## Cómo el workflow despliega el stack del sitio

En el job `deploy` (environment `landing-staging`, solo `main`, `id-token: write`):

```bash
cd infra
npm ci
npx cdk deploy m3tric-staging-LandingSiteStack --require-approval never \
  -c env=staging -c gitSha="$GITHUB_SHA" -c releaseId="<release-id>"
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack \
  --query 'Stacks[0].Outputs' --output json
```

La CLI de CDK encadena desde el rol de GitHub hacia los roles del bootstrap (`file-publishing`
para subir la plantilla, `deploy` para CloudFormation). `DescribeStacks` con el rol de GitHub
sirve para leer las salidas. La publicación (`s3 sync`, invalidación) la hace el mismo rol con
la política del stack del sitio. El primer despliegue tarda varios minutos por CloudFront.

## Modelo de seguridad y riesgos aceptados

- **Sin credenciales de larga duración**: solo OIDC. La confianza es por `sub` exacto del
  environment `landing-staging`, que en GitHub está restringido a la rama `main`
  (verificado el 2026-10-01). El repo usa el formato de `sub` heredado
  (`use_immutable_subject: false`, prefijo `repo:Alexic12/m3tric-landing`, verificado por API);
  si alguien activa el formato inmutable (`repo:Alexic12@<owner-id>/m3tric-landing@<repo-id>:...`)
  el rol deja de poder asumirse hasta actualizar `githubOidcSubject` y redesplegar la identidad.
- **El workflow no puede ampliar su propia identidad**: el rol vive en otro stack, que despliega
  una persona.
- **Riesgo aceptado (ADR-002)**: el rol `deploy` de CDK ejecuta CloudFormation con la política
  por defecto del bootstrap. En esta cuenta, `cdk-hnb659fds-cfn-exec-role` tiene
  **`AdministratorAccess`** (verificado el 2026-10-01). Quien pueda ejecutar el job `deploy`
  puede, en la práctica, desplegar cualquier recurso. Mitigaciones: protección del environment
  (solo `main`), revisión obligatoria de PR, y cdk-nag + pruebas de plantillas exactas en CI.
  Endurecerlo (bootstrap con `--cloudformation-execution-policies` acotadas o un permissions
  boundary) es una mejora fuera del alcance de esta entrega.
- **Bucket privado**: BPA total, solo CloudFront (esta distribución, por OAC y `AWS:SourceArn`)
  lee objetos; TLS obligatorio en ambos buckets; SSE-S3 en reposo.
- **Tema SNS sin KMS**: Budgets no puede publicar en un tema cifrado con la clave administrada
  por AWS, y una CMK (~USD 1/mes) es el 10 % del presupuesto; los mensajes solo llevan umbrales
  de costo públicos.
- **TLS**: con el certificado por defecto `*.cloudfront.net` no se puede fijar la política mínima
  de TLS. Ver dependencias.
- **Auditoría npm**: `npm audit` reporta `brace-expansion` (alta) **empaquetado dentro de
  `aws-cdk-lib`** (lo usa `minimatch` para globs de assets en síntesis). No es alcanzable con
  entrada no confiable, no se puede sobreescribir (es un `bundledDependency`) y el repo de la
  plataforma tiene el mismo hallazgo. Se resuelve al subir `aws-cdk-lib` cuando AWS lo corrija.

### Supresiones de cdk-nag

Cada una está acotada a un recurso (y, en IAM5, a un hallazgo concreto). La prueba
`test/app.test.ts` exige exactamente esta tabla y que cada supresión oculte un hallazgo real
(sin supresiones obsoletas).

| Regla | Recurso | Motivo |
|---|---|---|
| `AwsSolutions-IAM5[Resource::arn:aws:cloudformation:us-east-2:147997127433:stack/m3tric-staging-LandingSiteStack/*]` | `LandingDeliveryIdentityStack/GitHubDeployRole` | El `/*` es el UUID del stack, que CloudFormation asigna al crearlo; el permiso está fijado al nombre del único stack del sitio. |
| `AwsSolutions-IAM5[Resource::<SiteBucket.Arn>/*]` | `LandingSiteStack/PublishPolicy` | `aws s3 sync --delete` necesita leer, escribir y borrar claves arbitrarias del export; acotado a este único bucket. |
| `AwsSolutions-CFR1` (advertencia) | `LandingSiteStack/Distribution` | Landing pública sin requisito de restricción geográfica. |
| `AwsSolutions-CFR2` (advertencia) | `LandingSiteStack/Distribution` | WAF fuera de alcance (Anexo 1 §13.2): sitio estático GET/HEAD sin formularios ni API; costaría más que todo el presupuesto. |
| `AwsSolutions-CFR4` | `LandingSiteStack/Distribution` | Sin dominio propio, CloudFront no permite fijar TLS mínimo con el certificado por defecto. Dominio + ACM es dependencia del cliente (REQ-A09). |

`AwsSolutions-S1` no aplica al LogsBucket (cdk-nag lo da por bueno al ser destino de los logs de
acceso del SiteBucket) y `AwsSolutions-SNS2` no forma parte del paquete AwsSolutions en cdk-nag
3.0.2, así que no se suprimen.

## Costo estimado (estimación, no medición)

Con tráfico de landing (miles de visitas/mes, pocos MB de sitio):

| Concepto | Estimado mensual |
|---|---|
| S3 (almacenamiento < 50 MB con versiones, PUT/GET por despliegue) | < USD 0,05 |
| CloudFront (dentro de la capa gratuita permanente: 1 TB y 10 M solicitudes/mes) | ≈ USD 0 |
| Invalidaciones (`/*` cuenta como 1 ruta; 1.000 rutas/mes gratis) | USD 0 |
| Logs (CloudFront + S3, retención 90 días) | < USD 0,05 |
| AWS Budgets (es el 2.º presupuesto de la cuenta, dentro de los gratuitos) | USD 0 |
| SNS (sin suscripciones) | USD 0 |
| **Total** | **< USD 2/mes** (probablemente < USD 1) |

## Dependencias antes de producción (y avisos para staging)

1. **Etiqueta de asignación de costos `Component`**: el presupuesto filtra por
   `user:Component$landing`, pero **solo cuenta gasto cuando la etiqueta está activada** en
   Billing. Estado consultado el 2026-10-01 (`aws ce list-cost-allocation-tags`): **ninguna
   etiqueta de usuario está activa** y `Component` todavía no aparece (aparece hasta 24 h después
   de que exista un recurso etiquetado). Tras el primer despliegue del sitio, activarla en
   *Billing → Cost allocation tags* o con
   `aws ce update-cost-allocation-tags-status --cost-allocation-tags-status TagKey=Component,Status=Active`.
   La activación no es retroactiva; hasta entonces el presupuesto marca USD 0.
2. **Destinatario de la alerta presupuestal**: el tema SNS queda sin suscripción (dependencia
   del cliente, SPEC §16.4). Para suscribir un correo institucional:
   `aws sns subscribe --topic-arn arn:aws:sns:us-east-2:147997127433:m3tric-staging-landing-budget-alerts --protocol email --notification-endpoint <correo>`.
3. **Dominio propio + ACM (us-east-1) + Route 53** (REQ-A09): habilita TLS 1.2+ mínimo y quita
   la supresión CFR4.

## Rollback y retiro

- Un despliegue fallido del stack del sitio se revierte solo (rollback de CloudFormation). El
  contenido se revierte con `rollback.yml` (reconstrucción desde git, ADR-007), sin tocar la
  infraestructura.
- Los buckets son `RETAIN`: borrar el stack del sitio **no** borra contenido ni logs (hay que
  vaciarlos y borrarlos a mano si se retira la landing).
- Orden de retiro: primero el stack del sitio (quita la política del rol), después el de
  identidad (desactivar antes su protección de terminación). Al revés, IAM rechaza borrar un rol
  que aún tiene una política en línea de otro stack.
