# Endurecimiento de seguridad — auditoría, migración y verificación en vivo

> **Evidencia cruda archivada:** [`security-raw-2026-10-01.txt`](security-raw-2026-10-01.txt) contiene las salidas reales de AWS (estado y rol del stack, confianza y políticas del rol de GitHub, recursos IAM del stack del sitio, 18 simulaciones `simulate-principal-policy`, eventos de CloudTrail, cabeceras en el borde y GET directo a S3), generadas por el Tech Lead el 2026-10-01 después de `deploy-3-7c618b7`. La simulación cubre las **cuatro** distribuciones de la cuenta: el rol de ejecución solo puede actualizar la de la landing (`E1J2L9XZIAGQ7M`) y queda denegado en la de la plataforma (`E3LBUHUINTWS0F`), FlyPark (`E23SMG4PVU4M60`) y prereview (`E1F8V5D243P9EW`).


Fecha: 2026-10-01 · Entorno: `staging` · Cuenta `147997127433` · `us-east-2` · Sitio: `https://d21guxd9tjai7a.cloudfront.net`
Release en vivo al corte: **`deploy-3-7c618b7`** (commit `7c618b7`).

Este documento archiva el resultado de la auditoría de seguridad (opus) y de su corrección: hallazgo → arreglo → evidencia, el registro de la migración, las pruebas de denegación sobre las políticas desplegadas, la revisión de CloudTrail, las cabeceras del borde, la gobernanza de GitHub y los riesgos residuales. El diseño resultante está en `docs/adr/ADR-002-app-cdk-propia-e-identidad-oidc.md` y `infra/README.md`.

**Procedencia de la evidencia.** Las comprobaciones contra AWS y GitHub las ejecutó el Tech Lead el 2026-10-01 con autorización del dueño de la cuenta. Las salidas crudas están archivadas en [`security-raw-2026-10-01.txt`](security-raw-2026-10-01.txt) (secciones 1–8: AWS; 9–13: configuración de GitHub), y los comandos son reproducibles en `infra/README.md` («Runbook de migración», pasos 0 a f). Lo que sí está identificado y es consultable: los runs de GitHub Actions citados abajo, el manifiesto `_deploy/manifest.json` de la release en vivo y las pruebas de `infra/test/`.

---

## 1. Resumen de la auditoría

| ID | Severidad | Hallazgo | Arreglo | Evidencia |
|---|---|---|---|---|
| H1 | Alta | `main` sin protección: no había regla de rama ni ruleset; la «revisión obligatoria de PR» que afirmaba la primera versión de ADR-002 no existía | Ruleset `main-protegida` (id 24312349): PR obligatorio, checks obligatorios, sin borrado ni *force-push*, sin actores con *bypass*. Además, el `environment` `landing-staging` deja de permitir *bypass* de administradores y la confianza OIDC exige `ref:refs/heads/main` (ya no depende solo de la configuración de GitHub) | §5 (gobernanza) y §2 (`sub` de la confianza) |
| H2 | Alta | El rol de GitHub asumía `cdk-hnb659fds-deploy-role`, que tiene permisos de CloudFormation sobre `Resource: *` y pasa `cdk-hnb659fds-cfn-exec-role` (`AdministratorAccess`): el workflow podía reescribir su propia identidad o cualquier stack de la cuenta. También podía asumir el rol `lookup` (`ReadOnlyAccess`) y el de publicación de assets del bucket compartido | El sitio usa `CliCredentialsStackSynthesizer` con un bucket de assets propio; el rol de GitHub no tiene `sts:AssumeRole` (Deny explícito); CloudFormation ejecuta como `m3tric-staging-landing-cfn-exec` (sin IAM, CloudFront fijado por ID); el rol de GitHub solo crea change sets del stack del sitio y solo con ese rol de ejecución | §2 (migración), §3 (simulación de políticas, filas 2 a 7 y 11 a 13) y §4 (CloudTrail) |
| M1 | Media | El token OIDC estaba disponible mientras corrían `npm ci` (con *install scripts* de dependencias), `next build` y `cdk synth` | Los jobs `synth` (deploy) y `build` (publish) no tienen `environment` ni `id-token`. Los jobs con el rol descargan el artefacto por id (`digest-mismatch: error`), verifican el sha256 de la lista, de cada archivo y que no sobre ninguno, y no instalan paquetes (salvo el CLI de CDK con `npm ci --ignore-scripts`) | `.github/workflows/deploy.yml`, `.github/workflows/publish.yml`; run `36920298884` (todos los jobs verdes) |
| M2 | Media | La confianza OIDC ligaba solo el environment (`sub = repo:…:environment:landing-staging`), no la rama ni el workflow | `sub` personalizado (`repo`, `context`, `ref`, `job_workflow_ref`) y confianza `StringEquals` sobre `aud` y tres `sub` exactos, uno por workflow (`deploy.yml`, `publish.yml`, `rollback.yml`) en `refs/heads/main` | §2 pasos a y b; `infra/test/delivery-identity-stack.test.ts` (confianza exacta) |
| L | Baja | Las respuestas exponían `server: AmazonS3`, `x-amz-version-id` y `x-amz-server-side-encryption` | La política de cabeceras de CloudFront quita `server`, `x-amz-version-id`, `x-amz-server-side-encryption`, `x-amz-request-id` y `x-amz-id-2` (`RemoveHeadersConfig`) | §6 |

Estado al corte: los cinco hallazgos están **corregidos y verificados en vivo**. Lo que queda abierto es aceptado o depende de terceros (§7).

---

## 2. Registro de la migración (runbook de `infra/README.md`)

Ejecutado por el Tech Lead el 2026-10-01 con autorización del dueño de la cuenta. Estado de partida: stack del sitio asociado a `cdk-hnb659fds-cfn-exec-role` (administrador) y con la política IAM `m3tric-staging-landing-publish` sobre el rol de GitHub.

| Paso | Qué se hizo | Resultado |
|---|---|---|
| a | Se desplegó el stack de identidad `m3tric-staging-LandingDeliveryIdentityStack` (persona, perfil de administración) | Actualizado **sin reemplazos**. El rol de GitHub queda con las políticas en línea `LandingSiteDeploy` y `LandingSitePublish`. Bucket de assets `m3tric-staging-landing-cdk-assets-147997127433-us-east-2` con Block Public Access en `true` (los cuatro valores). Confianza: `StringEquals` sobre `aud` y sobre tres `sub`: `repo:Alexic12/m3tric-landing:environment:landing-staging:ref:refs/heads/main:job_workflow_ref:Alexic12/m3tric-landing/.github/workflows/{deploy,publish,rollback}.yml@refs/heads/main` |
| b | Se personalizó el `sub` OIDC del repositorio | `include_claim_keys: [repo, context, ref, job_workflow_ref]`, `use_immutable_subject: false` |
| c | Se migró el stack del sitio con el rol de ejecución **anterior** (última vez que se usa el rol del bootstrap) | Se retiró `PublishPolicy`; el stack del sitio queda con **0 recursos `AWS::IAM::*`**; se añadió `RemoveHeadersConfig` a la política de cabeceras |
| d | Se volvió a desplegar el sitio con el rol de ejecución **acotado** `m3tric-staging-landing-cfn-exec` | `RoleARN` del stack = rol acotado; `UPDATE_COMPLETE`; `ReleaseId` = `scoped-202610011` |
| e | Se definió la variable `AWS_CFN_EXEC_ROLE_ARN` en el environment `landing-staging` | Establecida |
| f | Se fusionó el PR #11 con CI verde; el workflow desplegó por la cadena acotada | `RoleARN` del stack sigue siendo el rol acotado; `ReleaseId` = `deploy-3-7c618b7` |

### Runs de GitHub Actions que respaldan la migración y el rollback

| Run | Workflow | Release | Resultado |
|---|---|---|---|
| `36869421270` | Deploy staging | `deploy-1-19f4f15` | verde; smoke aprobado |
| `36870809775` | Rollback staging | `rollback-36870809775-f4bdc1c` | verde; smoke aprobado |
| `36871068392` | Deploy staging | `deploy-2-19f4f15` | verde; smoke aprobado |
| `36920298884` | Deploy staging | `deploy-3-7c618b7` | **todos los jobs verdes** (ver abajo); smoke 10/10 |

Jobs del run `36920298884`: CI (Hygiene, Infra CDK, Release gate staging y production, E2E chromium, firefox y webkit en macOS) → `CDK synth` → `CDK deploy` → `Publish / build` → `Publish / publish`. Es el primer despliegue completo con la cadena acotada (sin ningún rol del bootstrap compartido).

---

## 3. Simulación de políticas sobre lo desplegado (13 casos)

`aws iam simulate-principal-policy` sobre las políticas **desplegadas** de ambos roles, tras el paso f. Los 13 resultados coinciden con lo esperado.

| # | Principal | Acción | Recurso | Resultado | Esperado |
|---|---|---|---|---|---|
| 1 | Rol de GitHub | `iam:CreateUser` | un usuario cualquiera | implicitDeny | sí |
| 2 | Rol de GitHub | `sts:AssumeRole` | `cdk-hnb659fds-deploy-role` | **explicitDeny** | sí |
| 3 | Rol de GitHub | `sts:AssumeRole` | `cdk-hnb659fds-cfn-exec-role` | **explicitDeny** | sí |
| 4 | Rol de GitHub | `cloudformation:UpdateStack` | stack de identidad | **explicitDeny** | sí |
| 5 | Rol de GitHub | `cloudformation:CreateChangeSet` (con `RoleArn`) | stack de identidad | **explicitDeny** | sí |
| 6 | Rol de GitHub | `cloudformation:UpdateStack` | stack del sitio | implicitDeny | sí |
| 7 | Rol de GitHub | `cloudformation:CreateChangeSet` **sin** `RoleArn` | stack del sitio | implicitDeny | sí |
| 8 | Rol de GitHub | `cloudformation:CreateChangeSet` con `RoleArn` = rol acotado | stack del sitio | **allowed** | sí |
| 9 | Rol de GitHub | `s3:GetObject` | bucket de assets compartido del bootstrap | implicitDeny | sí |
| 10 | Rol de GitHub | `s3:PutObject` | bucket del sitio | **allowed** | sí |
| 11 | Rol de ejecución acotado | `iam:PutRolePolicy` | rol de GitHub | **explicitDeny** | sí |
| 12 | Rol de ejecución acotado | `cloudfront:UpdateDistribution` | distribución de la plataforma `E3LBUHUINTWS0F` | implicitDeny | sí |
| 13 | Rol de ejecución acotado | `cloudfront:UpdateDistribution` | distribución de la landing `E1J2L9XZIAGQ7M` | **allowed** | sí |

Lectura: el rol de GitHub no puede crear identidades, encadenar roles, tocar el stack de identidad ni crear un change set que no pase el rol acotado; el rol acotado no puede cambiar IAM ni tocar la distribución de la plataforma. Los casos 8, 10 y 13 son las únicas permisiones positivas probadas, y son las que el despliegue necesita.

Comandos reproducibles (variable `sim` y contexto `cloudformation:RoleArn`): `infra/README.md`, paso f, «Pruebas de denegación».

---

## 4. CloudTrail

Revisión de las últimas 2 horas tras el despliegue `deploy-3-7c618b7`:

- El rol de GitHub muestra **solo `AssumeRoleWithWebIdentity`** como llamada de identidad.
- **Cero** eventos `AssumeRole` sobre los roles `cdk-hnb659fds-*`.

Es la confirmación independiente de que la cadena ya no pasa por el bootstrap compartido. Consulta reproducible por sesión: `infra/README.md`, paso f (`lookup-events` con `Username = landing-cdk-<run_id>`).

---

## 5. Gobernanza de GitHub (aplicada el 2026-10-01)

| Ajuste | Valor |
|---|---|
| Ruleset `main-protegida` (id `24312349`) | PR obligatorio con **0 aprobaciones**; *checks* obligatorios: `Hygiene`, `Infra (CDK)`, `Release gate (staging)`, `Release gate (production)`, `E2E (chromium)`, `E2E (firefox)`, `E2E (webkit)`; sin borrado; sin *force-push*; **sin actores con *bypass*** |
| Environment `landing-staging` | `can_admins_bypass = false`; política de ramas: solo `main` |
| Actions permitidas | las propiedad de GitHub y `aws-actions/configure-aws-credentials@*` |
| `sha_pinning_required` | `true` |
| Aprobación de workflows de PR desde forks | `all_external_contributors` |
| `sub` OIDC del repositorio | `include_claim_keys: [repo, context, ref, job_workflow_ref]`, `use_immutable_subject: false` |

Cambios de CI de la misma tanda (robustez, no seguridad): cada job E2E instala solo el navegador que usa; `apt` con reintentos y plazos cortos; E2E de WebKit en `macos-15` (el espejo de Ubuntu detuvo dos veces la instalación de las dependencias de WebKit). Detalle en `.github/workflows/ci.yml`.

---

## 6. Cabeceras en el borde tras el endurecimiento

Comprobado en vivo el 2026-10-01 contra `https://d21guxd9tjai7a.cloudfront.net`:

| Cabecera | Estado |
|---|---|
| `server: AmazonS3` | **ausente** |
| `x-amz-version-id` | **ausente** |
| `x-amz-server-side-encryption` | **ausente** |
| `server: CloudFront` | presente: la agrega CloudFront mismo, no se puede quitar y no revela nada del origen |
| CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Robots-Tag` (staging) | las **7 presentes** |

`x-amz-request-id` y `x-amz-id-2` también están en la lista de cabeceras a quitar, pero CloudFront ya las elimina en orígenes S3 y no se veían en el borde; se conservan en la política por si cambia el origen (`infra/README.md`).

### Suite en vivo tras el endurecimiento

`npm run test:live` (Playwright contra la URL de CloudFront, `deploy-3-7c618b7`): **41 passed, 16 skipped, 0 failed**. Los 16 omitidos son los chequeos solo-Chromium (axe y HTTP) en firefox y webkit. El smoke del run `36920298884` pasó 10/10.

---

## 7. Riesgos residuales

### Aceptados o pendientes de terceros

| Riesgo | Por qué sigue abierto | Qué lo cierra |
|---|---|---|
| TLS 1.0/1.1 aceptado por el certificado por defecto de `*.cloudfront.net` | CloudFront no permite fijar la política mínima de TLS sin dominio propio. Es dependencia del cliente (REQ-A09) | Dominio + ACM (us-east-1) + Route 53; retirar la supresión `AwsSolutions-CFR4` |
| CSP con `'unsafe-inline'` en `script-src` y `style-src` | La exportación estática de Next.js incrusta sus scripts y estilos de arranque | En producción: CSP con *hashes* |
| Subject OIDC mutable (`use_immutable_subject: false`) | El nombre del repositorio puede reasignarse; la confianza compara nombres, no identificadores | Subject inmutable para producción (cambia el prefijo del `sub` y exige redesplegar la identidad) |
| PR sin aprobaciones obligatorias (0) | Hay un solo mantenedor; nadie más puede aprobar | Segundo revisor y revisores obligatorios en el environment de producción |
| Sin S3 Block Public Access a nivel de cuenta | Cuenta compartida: es decisión de su dueño. Hoy ese control no frena una plantilla de la landing que abra sus propios buckets | Decisión del dueño de la cuenta (recomendado activarlo) |
| Quien llegue a `main` controla la plantilla del sitio dentro del rol acotado | Puede cambiar políticas de los buckets de la landing, apuntar la distribución a otro origen o borrar recursos de la landing; no puede tocar IAM ni otros proyectos | Aprobaciones obligatorias (fila anterior) y S3 BPA de cuenta |
| El paquete `aws-cdk` corre con el rol en el job `infra` | Inherente a cualquier herramienta de despliegue. Mitigado con versión fijada, integridad del lockfile y `--ignore-scripts` | — |

### Fuera de alcance de esta landing: avisar al dueño de la cuenta

En la **misma cuenta**, el rol `github_actions` confía en `repo:f2x-flypass/prereview-bot:*` (**cualquier rama**). No pertenece a la landing y no se modificó. Debe revisarlo el dueño de la cuenta.

---

## 8. Limitaciones de este archivo

- Las salidas de AWS y de las API de GitHub citadas en §2, §3, §4, §5 y §6 están archivadas en crudo en `security-raw-2026-10-01.txt`. Para repetirlas, usar los comandos de `infra/README.md`.
- Las pruebas de plantilla (`infra/test/*.test.ts`) y el resultado de CI del run `36920298884` sí son verificables sin acceso a AWS.
- La medición de Lighthouse en vivo de `docs/evidence/live/` se hizo sobre `deploy-2-19f4f15`; no se repitió sobre `deploy-3-7c618b7` (la suite en vivo sí se repitió sobre `deploy-3`, §6; el rendimiento no).
