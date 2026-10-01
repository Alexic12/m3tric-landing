# Infraestructura de la landing M3TRIC (AWS CDK v2)

App CDK en TypeScript que crea la infraestructura de la landing estática en la cuenta
`147997127433`, región `us-east-2` (CloudFront es global). Implementa `docs/SPEC.md` §10
y es la que consumen los workflows de §11. El modelo de confianza está en
`docs/adr/ADR-002-app-cdk-propia-e-identidad-oidc.md`.

Versiones fijadas (alineadas con `M3TRIC_Platform/infrastructure/cdk`): Node `24.19.0`
(`.node-version`, `engine-strict`), `aws-cdk-lib 2.267.0`, CLI `aws-cdk 2.1138.0`,
`constructs 10.8.1`, `cdk-nag 3.0.2`, `zod 4.4.3`, `vitest 4.1.11`, `typescript 5.9.3`.

## Estructura

| Ruta | Qué es |
|---|---|
| `bin/landing.ts` | Punto de entrada: lee el contexto, carga la configuración, arma la app y registra cdk-nag. |
| `lib/config.ts` | Esquema zod de `config/<env>.json` y del contexto `env` / `gitSha` / `releaseId`; etiquetas obligatorias. |
| `lib/names.ts` | Nombres físicos compartidos (stacks, roles, bucket de assets, prefijos de nombres). |
| `lib/landing-app.ts` | Construye los dos stacks con etiquetas, sintetizadores y nombres. La usan `bin` y las pruebas. |
| `lib/delivery-identity-stack.ts` | `m3tric-staging-LandingDeliveryIdentityStack` (lo despliega una persona). |
| `lib/landing-site-stack.ts` | `m3tric-staging-LandingSiteStack` (lo despliega el workflow). |
| `lib/nag.ts` | `acknowledgeFinding`: reconoce **un** hallazgo de cdk-nag cuyo id contiene `::` (ARN de S3/Budgets). |
| `config/staging.json` | Valores de staging (no secretos), incluidos los IDs de CloudFront del sitio vivo. |
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

## Modelo de entrega (desde la auditoría del 2026-10-01)

```
GitHub job (OIDC, sub = repo + environment + ref + workflow)
  └─ m3tric-staging-landing-github-deploy           (sin sts:AssumeRole)
       ├─ s3:PutObject  landing-cdk-assets/site/*   (plantilla del stack del sitio)
       ├─ cloudformation:CreateChangeSet            (solo stack del sitio, solo con RoleARN = cfn-exec)
       ├─ iam:PassRole  cfn-exec → cloudformation.amazonaws.com
       └─ publicación: s3 sync al bucket del sitio + invalidación de ESA distribución
CloudFormation (stack del sitio)
  └─ m3tric-staging-landing-cfn-exec                (cero IAM; S3/CloudFront/SNS/Budgets de la landing)
```

- **Ningún rol del bootstrap compartido** (`cdk-hnb659fds-*`) interviene en el despliegue del sitio:
  el stack del sitio usa `CliCredentialsStackSynthesizer` (las credenciales del propio job) con un
  bucket de assets **propio** de la landing. La plantilla sintetizada no tiene parámetro
  `BootstrapVersion` ni regla `CheckBootstrapVersion` (prueba
  `app.test.ts › «synthesizes the site stack with CLI credentials…»`).
- **CloudFormation ejecuta como un rol acotado**, nunca como `cdk-hnb659fds-cfn-exec-role`
  (`AdministratorAccess`). El rol de GitHub solo puede crear change sets que pasen ese rol
  (condición `cloudformation:RoleArn`), y el stack lo tiene asociado (paso d del runbook).
- **El workflow no puede tocar su propia identidad**: no tiene permisos de IAM; la ejecución de
  CloudFormation tampoco (Allow ausente + Deny explícito de `iam:*`); y un Deny con `NotResource`
  le impide cualquier acción de CloudFormation sobre otro stack, incluido el de identidad.
- **Sin token OIDC mientras corre código de dependencias** (`npm ci`, `next build`, `cdk synth`):
  esos jobs no tienen environment ni `id-token`. Los jobs con el rol descargan el artefacto por id,
  verifican el sha256 de cada archivo y no instalan paquetes (salvo el CLI de CDK con
  `--ignore-scripts`).

## Qué crea cada stack

### `m3tric-staging-LandingDeliveryIdentityStack` (lo despliega una persona)

Usa el bootstrap compartido (`DefaultStackSynthesizer`, qualifier `hnb659fds`, versión ≥ 6; la
cuenta tiene la 31) porque lo despliega una persona con credenciales de administración. Protección
de terminación activada.

- **Importa** (no crea) el proveedor OIDC
  `arn:aws:iam::147997127433:oidc-provider/token.actions.githubusercontent.com`.
- **Bucket de assets** `m3tric-staging-landing-cdk-assets-147997127433-us-east-2`: BPA total, SSE-S3,
  TLS obligatorio, `BucketOwnerEnforced`, los objetos expiran a los 30 días, RETAIN. Solo guarda la
  plantilla del stack del sitio (`site/<hash>.json`).
- **Rol de ejecución de CloudFormation** `m3tric-staging-landing-cfn-exec` (path `/m3tric/delivery/`):
  - Confianza: `cloudformation.amazonaws.com` con `aws:SourceAccount = 147997127433`.
  - Política en línea `LandingSiteResources`, derivada de los permisos de los *handlers* de cada tipo
    (`aws cloudformation describe-type --type RESOURCE --type-name <tipo> --query Schema`) y limitada
    a las propiedades que usa el stack:
    - S3 (crear/borrar, etiquetas, cifrado, BPA, ownership, versionado, ciclo de vida, logging, ACL de
      bucket, política de bucket + lecturas del handler) sobre `arn:aws:s3:::m3tric-staging-landingsitestack-*`.
    - CloudFront **fijado por ID** (`config.siteCloudFront`): distribución `E1J2L9XZIAGQ7M`, OAC
      `E3QYZ9YDRZ4IZP`, política de cabeceras `952c4e4a-adb6-4ed4-b06a-dbc54cac2676`. Sin `Create*`.
    - SNS sobre `arn:aws:sns:us-east-2:147997127433:m3tric-staging-landing-*`; Budgets sobre
      `arn:aws:budgets::147997127433:budget/m3tric-staging-landing-*`.
    - **Deny** explícito de `iam:*`, `sts:AssumeRole`, `organizations:*` y `cloudformation:*`.
- **Rol de GitHub** `m3tric-staging-landing-github-deploy` (path `/m3tric/delivery/`, sesión máx. 1 h):
  - Confianza: `sts:AssumeRoleWithWebIdentity`, `StringEquals` exacto `aud = sts.amazonaws.com` y
    `sub` ∈ (generados por `githubOidcSubjects()`):

    ```
    repo:Alexic12/m3tric-landing:environment:landing-staging:ref:refs/heads/main:job_workflow_ref:Alexic12/m3tric-landing/.github/workflows/deploy.yml@refs/heads/main
    repo:Alexic12/m3tric-landing:environment:landing-staging:ref:refs/heads/main:job_workflow_ref:Alexic12/m3tric-landing/.github/workflows/publish.yml@refs/heads/main
    repo:Alexic12/m3tric-landing:environment:landing-staging:ref:refs/heads/main:job_workflow_ref:Alexic12/m3tric-landing/.github/workflows/rollback.yml@refs/heads/main
    ```

    Exige la personalización del `sub` del repositorio
    `include_claim_keys: ["repo","context","ref","job_workflow_ref"]` (paso b del runbook).
  - Política en línea `LandingSiteDeploy`: `DescribeStacks`, `DescribeStackEvents`, `DescribeEvents`,
    `DescribeStackResources`, `GetTemplate`, `GetTemplateSummary`, `DescribeChangeSet`,
    `ExecuteChangeSet`, `DeleteChangeSet`, `ListChangeSets` y `CreateChangeSet` (este solo con
    `cloudformation:RoleArn` = rol de ejecución) sobre `stack/m3tric-staging-LandingSiteStack/*`;
    `iam:PassRole` del rol de ejecución solo hacia `cloudformation.amazonaws.com`;
    `s3:GetBucketLocation`/`GetEncryptionConfiguration`, `s3:ListBucket` (prefijo `site/`) y
    `s3:GetObject`/`PutObject` en `site/*` del bucket de assets. Deny de `cloudformation:*` fuera del
    stack del sitio y Deny de `sts:AssumeRole`. **No** tiene `CreateStack`, `UpdateStack`,
    `DeleteStack` ni `UpdateTerminationProtection`.
  - Política en línea `LandingSitePublish`: `s3:ListBucket` en
    `arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*`; `s3:GetObject/PutObject/DeleteObject`
    en `…sitebucket*/*`; `cloudfront:CreateInvalidation/GetInvalidation` en
    `distribution/E1J2L9XZIAGQ7M`. Su nombre **no** es el de la antigua `m3tric-staging-landing-publish`
    a propósito: durante la migración ambas conviven en el mismo rol y CloudFormation borra la vieja
    por nombre.
- **Salidas**: `RoleArn` (variable `AWS_DEPLOY_ROLE_ARN`), `CfnExecRoleArn` (variable
  `AWS_CFN_EXEC_ROLE_ARN`), `AssetsBucketName`.

### `m3tric-staging-LandingSiteStack` (lo despliega GitHub Actions)

**Ningún recurso `AWS::IAM::*`** (prueba `landing-site-stack.test.ts › «contains no AWS::IAM::* resource…»`).

- **SiteBucket**: BPA total, SSE-S3, versionado, `enforceSSL`, `BucketOwnerEnforced`, versiones no
  actuales expiran a los 90 días, logs de acceso al LogsBucket (`s3-access/`), RETAIN.
- **LogsBucket**: BPA total, SSE-S3, `enforceSSL`, `BucketOwnerPreferred` (lo exigen los logs
  estándar de CloudFront, que escriben por ACL), expiración a 90 días, RETAIN.
- **Distribution**: origen S3 con **OAC** (sin OAI), `index.html` como raíz, HTTP/2 y HTTP/3,
  `redirect-to-https`, `PriceClass_100`, compresión, `CachingOptimized`, errores 403 y 404 →
  `/404.html` con estado 404 (TTL 60 s), logs estándar en `LogsBucket/cloudfront/`.
- **ResponseHeadersPolicy** `m3tric-staging-landing-security-headers`: CSP, HSTS
  (`max-age=63072000; includeSubDomains`), `nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` y, solo si
  `robotsNoindex` es `true` (staging, ADR-004), `X-Robots-Tag: noindex, nofollow`. Todas con
  `override`. **Quita** las cabeceras de implementación del origen: `server`, `x-amz-version-id`,
  `x-amz-server-side-encryption`, `x-amz-request-id`, `x-amz-id-2` (las dos últimas CloudFront ya las
  quita en orígenes S3 —no se veían en el borde el 2026-10-01—; se listan por si cambia el origen).
  Ninguna está en la lista de cabeceras que CloudFront no permite quitar; CDK solo valida cinco de
  esa lista, así que la prueba real es el despliegue (paso c) y el `curl` de verificación.
- **Presupuesto** `m3tric-staging-landing-monthly`: USD 10/mes, tipo COST, filtrado por
  `user:Component$landing`; aviso cuando el gasto **real** supera el 80 % → tema SNS
  `m3tric-staging-landing-budget-alerts` (solo publica Budgets, solo por TLS; **sin suscripción**).
- **Salidas**: `SiteBucketName`, `DistributionId`, `DistributionDomainName`, `SiteUrl`.

El stack del sitio no depende del de identidad en el despliegue (sin `Fn::ImportValue`); el de
identidad concede permisos sobre el del sitio **por nombre**: el prefijo de nombres de bucket
(`<nombre del stack>-<id lógico>-…`, en minúsculas) y los IDs de CloudFront de
`config/staging.json`. La prueba `landing-site-stack.test.ts › «keeps the physical-name prefix…»`
falla si se renombra el stack o el constructo `SiteBucket`.

## Cómo el workflow despliega el stack del sitio

`deploy.yml` (push a `main` o `workflow_dispatch`):

1. `ci` (reutiliza `ci.yml`).
2. `synth` — sin environment y sin `id-token`: `npm ci`, `cdk synth` (cdk-nag incluido), sha256 de
   cada archivo de `cdk.out`, artefacto `cdk-out-<run>-<intento>` (1 día).
3. `infra` — environment `landing-staging`, `id-token: write`: comprueba `vars.AWS_CFN_EXEC_ROLE_ARN`,
   descarga el artefacto **por id** (`digest-mismatch: error`), verifica el sha256 de la lista (salida
   del job `synth`), de cada archivo, y que no sobre ninguno; `npm ci --ignore-scripts` solo para el CLI
   fijado; y:

   ```bash
   npx cdk deploy m3tric-staging-LandingSiteStack --app cdk.out --exclusively \
     --role-arn "$AWS_CFN_EXEC_ROLE_ARN" --method=change-set \
     --require-approval never --no-notices --outputs-file cdk-outputs.json
   ```

   Llamadas que hace el CLI 2.1138 con estas credenciales (revisado en `node_modules/aws-cdk`):
   `GetBucketLocation`, `GetBucketEncryption`, `ListObjectsV2` y `PutObject` en el bucket de
   assets; `DescribeStacks`, `GetTemplate`, `DeleteChangeSet` (limpia uno anterior),
   `CreateChangeSet`, `DescribeChangeSet`, `ExecuteChangeSet`, `DescribeStackEvents` y, solo al
   diagnosticar un fallo, `DescribeStackResources`/`ListChangeSets`. Busca el stack `CDKToolkit` para
   dos chequeos opcionales: el Deny lo rechaza y el CLI lo trata como «no hay bootstrap» (está
   capturado en el código), sin efecto en el despliegue.
4. `publish` (reutiliza `publish.yml`): `build` sin environment ni `id-token` (`npm ci`,
   `npm run release`, sha256 de `out/`, artefacto) y `publish` con el rol (descarga por id, verifica,
   `publish.sh`, `smoke.mjs`, `manifest.mjs`, `upload-manifest.sh`; ninguno usa paquetes npm).

Riesgo residual de la cadena: el propio paquete `aws-cdk` (íntegro según el lockfile) corre con el
rol, como cualquier herramienta de despliegue; y una dependencia comprometida en `synth`/`build`
puede alterar la plantilla o el contenido, pero no obtiene el token y lo que despliega queda dentro
del rol de ejecución (ADR-002).

## Runbook de migración (2026-10-01, lo ejecuta el Tech Lead)

Estado de partida: el stack del sitio está asociado a `cdk-hnb659fds-cfn-exec-role` (admin) y
contiene la política `m3tric-staging-landing-publish` sobre el rol de GitHub. **Congelar `main`**
hasta el paso f: desde el paso a, los workflows de `main` (versión anterior) fallan al asumir el rol,
sin efectos (no llegan a AWS).

Prerrequisitos: perfil local `flypark` con administración; Node 24.19.0; este cambio **commiteado**
(la etiqueta `GitSha` debe nombrar código real) y la rama en ese commit.

```bash
export AWS_PROFILE=flypark AWS_REGION=us-east-2
cd infra && npm ci && npm run typecheck && npm test && npm run lint
SHA=$(git rev-parse HEAD)
STAMP=$(date +%Y%m%d%H%M)
ADMIN_EXEC=arn:aws:iam::147997127433:role/cdk-hnb659fds-cfn-exec-role-147997127433-us-east-2
SCOPED_EXEC=arn:aws:iam::147997127433:role/m3tric/delivery/m3tric-staging-landing-cfn-exec
GH_ROLE=arn:aws:iam::147997127433:role/m3tric/delivery/m3tric-staging-landing-github-deploy
```

### 0. Comprobaciones previas (solo lectura)

```bash
aws sts get-caller-identity --query Account --output text
#  147997127433
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack \
  --query 'Stacks[0].[StackStatus,RoleARN]' --output text
#  CREATE_COMPLETE (o UPDATE_COMPLETE)   arn:aws:iam::147997127433:role/cdk-hnb659fds-cfn-exec-role-147997127433-us-east-2
aws cloudfront get-distribution-config --id E1J2L9XZIAGQ7M \
  --query 'DistributionConfig.[Origins.Items[0].OriginAccessControlId,DefaultCacheBehavior.ResponseHeadersPolicyId]' --output text
#  E3QYZ9YDRZ4IZP   952c4e4a-adb6-4ed4-b06a-dbc54cac2676     (= config/staging.json › siteCloudFront)
```

Si algún ID no coincide, **parar**: corregir `config/staging.json` antes de seguir.

### a. Desplegar el nuevo stack de identidad (humano)

```bash
npx cdk diff m3tric-staging-LandingDeliveryIdentityStack -c env=staging -c gitSha=$SHA -c releaseId=identity-$STAMP
npx cdk deploy m3tric-staging-LandingDeliveryIdentityStack -c env=staging -c gitSha=$SHA -c releaseId=identity-$STAMP
```

Diff esperado (revisarlo antes de aceptar los cambios de IAM): `[+]` `CdkAssetsBucket` y su
`BucketPolicy`, `[+]` `CfnExecRole`, `[~]` `GitHubDeployRole` (confianza: lista de tres `sub`;
políticas: `- LandingCdkDelivery`, `+ LandingSiteDeploy`, `+ LandingSitePublish`; descripción),
salidas `CfnExecRoleArn` y `AssetsBucketName`. Ningún reemplazo (`Replacement: True`).

Verificar:

```bash
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingDeliveryIdentityStack \
  --query 'Stacks[0].[StackStatus,Outputs]' --output json
#  "UPDATE_COMPLETE", con RoleArn = $GH_ROLE, CfnExecRoleArn = $SCOPED_EXEC,
#  AssetsBucketName = m3tric-staging-landing-cdk-assets-147997127433-us-east-2
aws iam list-role-policies --role-name m3tric-staging-landing-github-deploy --output text
#  LandingSiteDeploy  LandingSitePublish  m3tric-staging-landing-publish
#  (la última es del stack del sitio y se va en el paso c; si ya no aparece también es correcto:
#   LandingSitePublish concede lo mismo)
aws s3api get-public-access-block --bucket m3tric-staging-landing-cdk-assets-147997127433-us-east-2
#  los cuatro valores en true
```

**Efecto**: desde aquí ningún workflow puede asumir el rol (la confianza ya exige el `sub` nuevo).

### b. Personalizar el `sub` OIDC del repositorio

```bash
gh api -X PUT repos/Alexic12/m3tric-landing/actions/oidc/customization/sub --input - <<'JSON'
{"use_default": false, "include_claim_keys": ["repo", "context", "ref", "job_workflow_ref"]}
JSON
gh api repos/Alexic12/m3tric-landing/actions/oidc/customization/sub
#  {"use_default":false,"include_claim_keys":["repo","context","ref","job_workflow_ref"],"use_immutable_subject":false,...}
```

Si `use_immutable_subject` no es `false`, el prefijo del `sub` cambia
(`repo:Alexic12@<id>/…`) y la confianza del paso a no coincidirá: parar y avisar. El único rol de la
cuenta que confía en este repositorio es el de la landing (verificado con `aws iam list-roles` el
2026-10-01), así que el cambio no afecta a otros despliegues.

### c. Migrar el stack del sitio con el rol de ejecución ANTERIOR (humano)

Por qué con el rol admin: la nueva plantilla elimina el `AWS::IAM::Policy`
`m3tric-staging-landing-publish`, y CloudFormation lo borra con `iam:DeleteRolePolicy` sobre el rol
de GitHub. El rol acotado **no puede** (no tiene IAM, y lo niega explícitamente); es la última vez que
se usa el rol del bootstrap, y lo pasa una persona.

```bash
npx cdk diff m3tric-staging-LandingSiteStack -c env=staging -c gitSha=$SHA -c releaseId=migration-$STAMP
#  esperado: [-] AWS::IAM::Policy PublishPolicy; [~] SecurityHeadersPolicy (RemoveHeadersConfig);
#  [-] parámetro BootstrapVersion y regla CheckBootstrapVersion; [-] salida PublishRoleName;
#  etiquetas GitSha/ReleaseId en los recursos etiquetables. Sin reemplazos.
npx cdk deploy m3tric-staging-LandingSiteStack --exclusively -c env=staging -c gitSha=$SHA \
  -c releaseId=migration-$STAMP --role-arn "$ADMIN_EXEC" --method=change-set
```

La CLI sube la plantilla al bucket de assets nuevo con las credenciales de la persona (el sitio ya
usa `CliCredentialsStackSynthesizer`).

Verificar:

```bash
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack \
  --query 'Stacks[0].[StackStatus,RoleARN]' --output text
#  UPDATE_COMPLETE   arn:aws:iam::147997127433:role/cdk-hnb659fds-cfn-exec-role-147997127433-us-east-2
aws cloudformation list-stack-resources --stack-name m3tric-staging-LandingSiteStack \
  --query "StackResourceSummaries[?starts_with(ResourceType, 'AWS::IAM')]" --output text
#  (vacío)
aws iam list-role-policies --role-name m3tric-staging-landing-github-deploy --output text
#  LandingSiteDeploy  LandingSitePublish
sleep 300   # propagación de la política de cabeceras en el borde
curl -sSI https://d21guxd9tjai7a.cloudfront.net/ | grep -iE '^(server|x-amz-version-id|x-amz-server-side-encryption|x-amz-request-id|x-amz-id-2):'
#  (vacío; las demás cabeceras de seguridad siguen presentes)
```

Si CloudFormation rechaza `RemoveHeadersConfig` (una cabecera no removible), el stack vuelve solo al
estado anterior: quitar esa cabecera de `REMOVED_ORIGIN_HEADERS` (y de la prueba) y repetir c.

### d. Re-desplegar con el rol de ejecución ACOTADO (humano)

Por qué: si una operación no pasa `RoleARN`, CloudFormation usa **el último rol asociado al stack**
(hoy, el admin). Este despliegue asocia el rol acotado, y el `releaseId` nuevo cambia la etiqueta
`ReleaseId` de cada recurso etiquetable, así que la actualización es real y ejercita los permisos
del rol acotado sobre buckets, distribución, tema SNS y presupuesto. (Además, IAM ya impide al rol de
GitHub crear change sets sin ese `RoleARN`.)

```bash
STAMP_D=$(date +%Y%m%d%H%M)
npx cdk deploy m3tric-staging-LandingSiteStack --exclusively -c env=staging -c gitSha=$SHA \
  -c releaseId=scoped-$STAMP_D --role-arn "$SCOPED_EXEC" --method=change-set
```

Verificar:

```bash
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack \
  --query "Stacks[0].[StackStatus,RoleARN,Tags[?Key=='ReleaseId'].Value|[0]]" --output text
#  UPDATE_COMPLETE   arn:aws:iam::147997127433:role/m3tric/delivery/m3tric-staging-landing-cfn-exec   scoped-<STAMP_D>
```

Si falla por permisos, CloudFormation revierte solo y el motivo nombra la acción que falta:

```bash
aws cloudformation describe-stack-events --stack-name m3tric-staging-LandingSiteStack --max-items 40 \
  --query "StackEvents[?contains(ResourceStatus, 'FAILED')].[LogicalResourceId,ResourceStatusReason]" --output text
```

Añadir esa acción a `LandingSiteResources` (`lib/delivery-identity-stack.ts` y su prueba), repetir el
paso a y luego este. Si la reversión también fallara (`UPDATE_ROLLBACK_FAILED`):
`aws cloudformation continue-update-rollback --stack-name m3tric-staging-LandingSiteStack --role-arn "$ADMIN_EXEC"`.
Si el error es «role … is invalid or cannot be assumed», CloudFormation no envía
`aws:SourceAccount` al asumir el rol: quitar esa condición de la confianza del rol de ejecución,
repetir a y d.

### e. Variable del environment de GitHub

```bash
gh variable set AWS_CFN_EXEC_ROLE_ARN --env landing-staging --repo Alexic12/m3tric-landing --body "$SCOPED_EXEC"
gh variable list --env landing-staging --repo Alexic12/m3tric-landing
#  AWS_CFN_EXEC_ROLE_ARN  arn:aws:iam::147997127433:role/m3tric/delivery/m3tric-staging-landing-cfn-exec
#  AWS_DEPLOY_ROLE_ARN    (sin cambios), AWS_REGION, PLATFORM_URL
```

### f. PR, merge y primer despliegue con la cadena acotada

Abrir el PR (CI sin AWS: `Hygiene`, `Infra (CDK)`, `Release gate (…)`, `E2E (…)`), mergear y
seguir el run de `Deploy staging` (`ci → synth → infra → publish (build → publish)`):

```bash
gh run watch "$(gh run list --repo Alexic12/m3tric-landing --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --repo Alexic12/m3tric-landing
aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack \
  --query "Stacks[0].[StackStatus,RoleARN,Tags[?Key=='ReleaseId'].Value|[0]]" --output text
#  UPDATE_COMPLETE   …/m3tric-staging-landing-cfn-exec   deploy-<n>-<sha7>
RUN_ID=<id del run>
aws cloudtrail lookup-events --lookup-attributes AttributeKey=Username,AttributeValue=landing-cdk-$RUN_ID \
  --query 'Events[].EventName' --output text | tr '\t' '\n' | sort | uniq -c
#  CreateChangeSet, DescribeChangeSet, ExecuteChangeSet, DescribeStacks, … y ningún AssumeRole
#  (CloudTrail tarda hasta ~15 min en mostrar los eventos)
```

Pruebas de denegación sobre las políticas desplegadas:

```bash
SITE_STACK_ID=$(aws cloudformation describe-stacks --stack-name m3tric-staging-LandingSiteStack --query 'Stacks[0].StackId' --output text)
IDENTITY_STACK_ID=$(aws cloudformation describe-stacks --stack-name m3tric-staging-LandingDeliveryIdentityStack --query 'Stacks[0].StackId' --output text)
sim() {   # funciona igual en bash y en zsh
  local extra=(); [ -n "${4:-}" ] && extra=(--context-entries "$4")
  aws iam simulate-principal-policy --policy-source-arn "$1" --action-names "$2" --resource-arns "$3" \
    "${extra[@]}" --query 'EvaluationResults[0].EvalDecision' --output text
}
ROLEARN_CTX="ContextKeyName=cloudformation:RoleArn,ContextKeyValues=$SCOPED_EXEC,ContextKeyType=string"
sim $GH_ROLE iam:CreateUser arn:aws:iam::147997127433:user/probe                                   # implicitDeny
sim $GH_ROLE sts:AssumeRole arn:aws:iam::147997127433:role/cdk-hnb659fds-deploy-role-147997127433-us-east-2  # explicitDeny
sim $GH_ROLE cloudformation:UpdateStack "$IDENTITY_STACK_ID"                                       # explicitDeny
sim $GH_ROLE cloudformation:CreateChangeSet "$IDENTITY_STACK_ID" "$ROLEARN_CTX"                    # explicitDeny
sim $GH_ROLE cloudformation:UpdateStack "$SITE_STACK_ID"                                           # implicitDeny
sim $GH_ROLE cloudformation:CreateChangeSet "$SITE_STACK_ID"                                       # implicitDeny (sin RoleARN)
sim $GH_ROLE cloudformation:CreateChangeSet "$SITE_STACK_ID" "$ROLEARN_CTX"                        # allowed
sim $GH_ROLE s3:GetObject arn:aws:s3:::cdk-hnb659fds-assets-147997127433-us-east-2/probe           # implicitDeny
sim $GH_ROLE s3:PutObject arn:aws:s3:::m3tric-staging-landingsitestack-logsbucket9c4d8843-rfrlniolfutg/probe  # implicitDeny
sim $SCOPED_EXEC iam:PutRolePolicy $GH_ROLE                                                         # explicitDeny
sim $SCOPED_EXEC cloudfront:UpdateDistribution arn:aws:cloudfront::147997127433:distribution/E23SMG4PVU4M60  # implicitDeny (FlyPark, otro proyecto)
```

Cualquier resultado distinto del comentado es un fallo: parar y revisar.

### Reversión por paso

| Paso | Cómo revertir |
|---|---|
| a | Desde un worktree de `19f4f15` (`git worktree add ../landing-19f4f15 19f4f15`), `cd infra && npm ci` y `npx cdk deploy m3tric-staging-LandingDeliveryIdentityStack -c env=staging -c gitSha=19f4f15890b21923f26e49ca628826a4a1071eeb -c releaseId=identity-revert-<fecha>`. Devuelve `LandingCdkDelivery` y la confianza antigua; el bucket de assets queda huérfano (RETAIN, se vacía solo en 30 días). Si ya se hizo el paso d, revertir antes d (el stack del sitio no puede operar con un rol borrado). |
| b | `gh api -X PUT repos/Alexic12/m3tric-landing/actions/oidc/customization/sub --input - <<< '{"use_default": true}'` |
| c | Desplegar la plantilla de `19f4f15` del sitio con `--role-arn "$ADMIN_EXEC"` (vuelve a crear `m3tric-staging-landing-publish`; no choca con `LandingSitePublish`). |
| d | Repetir el `cdk deploy` del sitio con `--role-arn "$ADMIN_EXEC"` (re-asocia el rol admin). |
| e | `gh variable delete AWS_CFN_EXEC_ROLE_ARN --env landing-staging --repo Alexic12/m3tric-landing` |
| f | Revertir el merge con un PR; el contenido se revierte con `rollback.yml` (ADR-007). Los workflows antiguos solo vuelven a funcionar si también se revierten a y b. |

## Recrear el stack del sitio o reemplazar un recurso de CloudFront

El rol acotado **no puede crear** distribuciones, OAC ni políticas de cabeceras (y está fijado a los
IDs actuales), así que un cambio que cree o reemplace uno de ellos falla en CloudFormation y se
revierte. Es intencional: cambia la URL o el comportamiento del borde. Procedimiento (humano):

1. Desplegar el sitio con `--role-arn "$ADMIN_EXEC"` (como en el paso c).
2. Copiar los IDs nuevos (`DistributionId`, el `OriginAccessControlId` de la distribución y el
   `ResponseHeadersPolicyId`) a `config/staging.json › siteCloudFront`, con su prueba.
3. Desplegar la identidad (paso a) y re-asociar el rol acotado (paso d).

Un entorno nuevo (p. ej. producción) sigue el mismo orden: identidad sin IDs aún no es posible, así
que se crea primero el sitio con un rol de administración y luego la identidad con sus IDs.

## Seguridad: riesgos residuales

Resumen; el detalle y el razonamiento están en ADR-002.

- Quien pueda poner código en `main` (PR sin aprobaciones obligatorias hoy) controla la plantilla
  del sitio **dentro** del rol de ejecución: puede cambiar políticas de los buckets de la landing
  (incluido hacer público el LogsBucket, con IPs de visitantes), apuntar la distribución a otro
  origen o borrar recursos de la landing. No puede tocar IAM, otros stacks, el bootstrap compartido,
  ni recursos de CloudFront/SNS/Budgets de otros proyectos.
- **S3 Block Public Access a nivel de cuenta no está configurado** (verificado el 2026-10-01). En
  una cuenta compartida, activarlo es decisión del dueño de la cuenta; lo recomendamos.
- Las lecturas que el *handler* de S3 hace de configuraciones no usadas (CORS, website, replicación…)
  están permitidas; sus escrituras no.

## Supresiones de cdk-nag

Cada una está acotada a un recurso y, en IAM5, a **un** hallazgo. Los hallazgos con ARN de S3 o
Budgets contienen `::`, que `Validations.acknowledge()` rechaza; se registran con
`acknowledgeFinding` (`lib/nag.ts`), que escribe la misma metadata. `test/app.test.ts` exige
exactamente esta tabla y que cada supresión oculte un hallazgo real.

| Regla | Recurso | Motivo |
|---|---|---|
| `AwsSolutions-IAM5[Resource::arn:aws:cloudformation:us-east-2:147997127433:stack/m3tric-staging-LandingSiteStack/*]` | `GitHubDeployRole` | El `/*` es el UUID del stack, asignado al crearlo. |
| `AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landing-cdk-assets-147997127433-us-east-2/site/*]` | `GitHubDeployRole` | La clave de la plantilla es un hash que cambia en cada síntesis; solo el prefijo `site/` del bucket propio. |
| `AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*]` | `GitHubDeployRole` | Sufijo aleatorio que CloudFormation pone al nombre del bucket del sitio. |
| `AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-sitebucket*/*]` | `GitHubDeployRole` | `aws s3 sync --delete` gestiona claves arbitrarias del export. |
| `AwsSolutions-IAM5[Resource::arn:aws:s3:::m3tric-staging-landingsitestack-*]` | `CfnExecRole` | Buckets del stack del sitio (nombre con sufijo aleatorio). |
| `AwsSolutions-IAM5[Resource::arn:aws:sns:us-east-2:147997127433:m3tric-staging-landing-*]` | `CfnExecRole` | Prefijo de nombres de la landing; el tema tiene nombre fijo. |
| `AwsSolutions-IAM5[Resource::arn:aws:budgets::147997127433:budget/m3tric-staging-landing-*]` | `CfnExecRole` | Prefijo de nombres de la landing; el presupuesto tiene nombre fijo. |
| `AwsSolutions-S1` | `CdkAssetsBucket` | Solo plantillas de la landing pública por 30 días; escritura limitada a un rol y un prefijo. |
| `AwsSolutions-CFR1` (advertencia) | `Distribution` | Landing pública sin requisito de restricción geográfica. |
| `AwsSolutions-CFR2` (advertencia) | `Distribution` | WAF fuera de alcance (Anexo 1 §13.2): sitio estático GET/HEAD sin formularios ni API. |
| `AwsSolutions-CFR4` | `Distribution` | Sin dominio propio no se puede fijar TLS mínimo. Dominio + ACM es dependencia del cliente (REQ-A09). |

`AwsSolutions-S1` no aplica al LogsBucket (es destino de los logs de acceso del SiteBucket) y
`AwsSolutions-SNS2` no forma parte del paquete AwsSolutions en cdk-nag 3.0.2.

## Costo estimado (estimación, no medición)

Con tráfico de landing (miles de visitas/mes, pocos MB de sitio):

| Concepto | Estimado mensual |
|---|---|
| S3 (almacenamiento < 50 MB con versiones, PUT/GET por despliegue) | < USD 0,05 |
| Bucket de assets (plantillas de ~20 KB, expiran a 30 días) | ≈ USD 0 |
| CloudFront (dentro de la capa gratuita permanente: 1 TB y 10 M solicitudes/mes) | ≈ USD 0 |
| Invalidaciones (`/*` cuenta como 1 ruta; 1.000 rutas/mes gratis) | USD 0 |
| Logs (CloudFront + S3, retención 90 días) | < USD 0,05 |
| AWS Budgets (es el 2.º presupuesto de la cuenta, dentro de los gratuitos) | USD 0 |
| SNS (sin suscripciones), roles IAM | USD 0 |
| **Total** | **< USD 2/mes** (probablemente < USD 1) |

## Dependencias antes de producción (y avisos para staging)

1. **Etiqueta de asignación de costos `Component`**: el presupuesto filtra por
   `user:Component$landing`, pero **solo cuenta gasto cuando la etiqueta está activada** en
   Billing (*Billing → Cost allocation tags* o
   `aws ce update-cost-allocation-tags-status --cost-allocation-tags-status TagKey=Component,Status=Active`).
   La activación no es retroactiva; hasta entonces el presupuesto marca USD 0.
2. **Destinatario de la alerta presupuestal**: el tema SNS queda sin suscripción (dependencia
   del cliente, SPEC §16.4):
   `aws sns subscribe --topic-arn arn:aws:sns:us-east-2:147997127433:m3tric-staging-landing-budget-alerts --protocol email --notification-endpoint <correo>`.
3. **Dominio propio + ACM (us-east-1) + Route 53** (REQ-A09): habilita TLS 1.2+ mínimo y quita
   la supresión CFR4.
4. **Revisores obligatorios** en el environment de producción y aprobaciones en el ruleset de `main`.

## Rollback y retiro

- Un despliegue fallido del stack del sitio se revierte solo (rollback de CloudFormation, con el rol
  acotado). El contenido se revierte con `rollback.yml` (reconstrucción desde git, ADR-007), sin
  tocar la infraestructura.
- Los buckets son `RETAIN`: borrar un stack **no** borra contenido, logs ni plantillas.
- Orden de retiro: primero el stack del sitio (con `--role-arn "$ADMIN_EXEC"` o una persona: el rol
  de GitHub no tiene `DeleteStack`), después el de identidad (desactivando antes su protección de
  terminación). Al revés, el stack del sitio quedaría asociado a un rol de ejecución inexistente.
