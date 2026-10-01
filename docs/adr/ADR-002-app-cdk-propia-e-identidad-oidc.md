# ADR-002 — App CDK propia, identidad OIDC en stack separado y cadena de entrega sin roles compartidos

| Campo | Valor |
|---|---|
| Estado | Aceptada — implementada y verificada 2026-10-01. Revisada tras auditoría de seguridad: sustituye a la versión que aceptaba el rol de despliegue del bootstrap |
| Fecha | 2026-10-01 |
| Alcance | `infra/**`, `.github/workflows/{deploy,publish,rollback}.yml`, environment `landing-staging` y personalización OIDC del repositorio |

## Contexto

La landing necesita infraestructura propia (S3 privado, CloudFront con OAC, cabeceras, presupuesto) y un mecanismo para que GitHub Actions la despliegue sin credenciales de larga duración (REQ-O06, REQ-A11). La cuenta AWS `147997127433` (región `us-east-2`) es **compartida**: el 2026-10-01 tenía 33 stacks de CloudFormation activos, de los que solo dos son de la landing, otras tres distribuciones de CloudFront (FlyPark, prereview, vista previa de la plataforma) con sus OAC, temas SNS y presupuestos de otros proyectos. Ya existían:

- un proveedor OIDC de GitHub (`token.actions.githubusercontent.com`), único por URL de emisor;
- un bootstrap de CDK (qualifier `hnb659fds`, versión 31) que usan todos los proyectos.

### Lo que la versión anterior de este ADR afirmaba y no era cierto

La primera versión (despliegue del PR #1) aceptaba un riesgo y lo mitigaba con controles que la auditoría del 2026-10-01 encontró falsos o incompletos, verificados contra la cuenta y el repositorio:

1. **«Revisión obligatoria de PR antes de `main`».** Falso. Al desplegar no había protección de rama ni ruleset. El ruleset `main-protegida` (creado el 2026-10-01 a las 08:58 −05:00) exige PR y checks, pero **0 aprobaciones** (`required_approving_review_count: 0`): con un solo mantenedor nadie más revisa.
2. **«El workflow no puede ampliar su propia identidad.»** Falso. El rol de GitHub asumía `cdk-hnb659fds-deploy-role`, que tiene (verificado en la cuenta) `CreateChangeSet`/`ExecuteChangeSet`, `CreateStack`/`UpdateStack`/`DeleteStack` y `UpdateTerminationProtection` sobre `Resource: *`, y pasa `cdk-hnb659fds-cfn-exec-role`, que tiene **`AdministratorAccess`**. El workflow podía, por tanto, quitar la protección de terminación del stack de identidad, reescribir su confianza y sus permisos, o modificar cualquier otro stack de la cuenta (hallazgo H2).
3. **«El permiso del rol de GitHub es acotado.»** Engañoso. Además de lo anterior, podía asumir `cdk-hnb659fds-lookup-role` (**`ReadOnlyAccess`**: lectura de datos de toda la cuenta, p. ej. objetos S3 y tablas de otros proyectos) y `cdk-hnb659fds-file-publishing-role` (escritura en el bucket de assets **compartido**, del que despliegan otros proyectos: envenenamiento de sus plantillas y assets).
4. **«Sin credenciales mientras se construye.»** No se afirmaba, pero tampoco se cumplía: el token OIDC estaba disponible durante `npm ci` (que ejecuta *install scripts* de dependencias) y el build (hallazgo M1).
5. **La confianza ligaba solo el environment** (`sub = repo:…:environment:landing-staging`), no la rama ni el workflow; la restricción a `main` existía solo como configuración del environment en GitHub (hallazgo M2).

Además, las respuestas exponían `server: AmazonS3`, `x-amz-version-id` y `x-amz-server-side-encryption` (hallazgo L).

## Decisión

1. **App CDK propia** en `infra/` (TypeScript, `aws-cdk-lib 2.267.0`, CLI `aws-cdk 2.1138.0`), con las convenciones de la plataforma, **sin reutilizar ni modificar stacks ajenos**. Dos stacks.
2. **Ningún rol del bootstrap compartido en la cadena del workflow.** El stack del sitio usa `CliCredentialsStackSynthesizer`: el CLI usa las credenciales del propio job, sube la plantilla a un **bucket de assets propio** (`m3tric-staging-landing-cdk-assets-147997127433-us-east-2`, prefijo `site/`) y la plantilla no depende de `BootstrapVersion`/SSM. El rol de GitHub no tiene `sts:AssumeRole` (y lo niega explícitamente).
3. **Rol de ejecución de CloudFormation propio y sin IAM**, `m3tric-staging-landing-cfn-exec`: confía en `cloudformation.amazonaws.com` con `aws:SourceAccount`; permisos derivados de los *handlers* de cada tipo de recurso y limitados a lo que usa el stack (S3 sobre `m3tric-staging-landingsitestack-*`; CloudFront **fijado a los IDs** de la distribución, OAC y política de cabeceras actuales, sin `Create*`; SNS y Budgets sobre el prefijo `m3tric-staging-landing-`). **Deny** explícito de `iam:*`, `sts:AssumeRole`, `organizations:*` y `cloudformation:*`. Ninguna plantilla que despliegue el workflow puede crear o cambiar un permiso.
4. **El rol de GitHub solo crea change sets sobre el stack del sitio, y solo con ese rol de ejecución** (`cloudformation:CreateChangeSet` con condición `cloudformation:RoleArn`; `iam:PassRole` solo de ese rol y solo hacia CloudFormation). Sin `CreateStack`, `UpdateStack`, `DeleteStack` ni `UpdateTerminationProtection`, y un Deny de `cloudformation:*` con `NotResource` = stack del sitio. El stack queda asociado al rol acotado (runbook, paso d), así que omitir `--role-arn` tampoco recupera el rol de administración.
5. **La política de publicación vive en el stack de identidad** (`LandingSitePublish`): `s3` sobre el bucket del sitio y `CreateInvalidation`/`GetInvalidation` sobre la distribución configurada. El stack del sitio no tiene ningún recurso `AWS::IAM::*`.
6. **Confianza OIDC por repo + environment + rama + workflow.** El repositorio personaliza el `sub` con `include_claim_keys: ["repo","context","ref","job_workflow_ref"]`, y el rol acepta exactamente tres valores: `environment:landing-staging`, `ref:refs/heads/main` y `job_workflow_ref` = `deploy.yml`, `publish.yml` o `rollback.yml` de este repositorio en `refs/heads/main`.
7. **Sin token mientras corre código de terceros.** Los jobs que ejecutan `npm ci`, `next build` y `cdk synth` no tienen environment ni `id-token`. Los jobs con el rol descargan el artefacto **por id**, verifican el sha256 de la lista (pasado como salida del job que la generó), de cada archivo y que no sobre ninguno, y no instalan paquetes, salvo el CLI de CDK con `npm ci --ignore-scripts`.
8. **Cabeceras de implementación fuera**: la política de cabeceras quita `server`, `x-amz-version-id`, `x-amz-server-side-encryption`, `x-amz-request-id` y `x-amz-id-2`.
9. **El stack de identidad lo despliega una persona** (con el bootstrap, como administrador), nunca el workflow.

## Límites de confianza resultantes

| Principal | Puede | No puede |
|---|---|---|
| Job de GitHub sin environment (`ci`, `synth`, `build`) | Ejecutar dependencias npm y el build; subir artefactos al run | Obtener el token OIDC ni leer variables del environment |
| Rol `m3tric-staging-landing-github-deploy` (jobs `infra`, `publish`, `stack` de rollback, solo desde `main`) | Subir `site/*` al bucket de assets propio; crear/ejecutar change sets del stack del sitio con el rol acotado; leer sus salidas; publicar en el bucket del sitio e invalidar su distribución | Asumir roles; tocar IAM; operar sobre otro stack (incluido el de identidad); `CreateStack`/`UpdateStack`/`DeleteStack`; usar el bootstrap compartido; leer o escribir otros buckets |
| CloudFormation como `m3tric-staging-landing-cfn-exec` | Gestionar los buckets del stack del sitio, actualizar o borrar **esa** distribución/OAC/política de cabeceras, el tema y el presupuesto de la landing | Cualquier acción de IAM, STS, Organizations o CloudFormation; crear recursos de CloudFront; tocar recursos de otros proyectos o los datos (objetos) de los buckets |
| Persona con administración (perfil `flypark`) | Todo, incluido el stack de identidad | — (fuera del alcance de este ADR) |

## Riesgos residuales (aceptados para staging)

1. **Control de la plantilla del sitio.** Quien pueda llevar código a `main` (hoy: abrir y mergear un PR, sin aprobación obligatoria) decide la plantilla del sitio dentro del rol acotado: puede cambiar políticas de los buckets de la landing (p. ej. hacer público el LogsBucket, que contiene IPs de visitantes), apuntar la distribución a otro origen (servir otro contenido en la URL de la landing), modificar el presupuesto o borrar recursos de la landing (los buckets son RETAIN). El radio de impacto queda en la landing.
2. **S3 Block Public Access de cuenta no configurado** (verificado el 2026-10-01). Si se activara, el punto 1 ya no podría volver públicos los buckets. En una cuenta compartida es decisión de su dueño.
3. **Dependencia comprometida en `synth` o `build`.** Puede alterar la plantilla o el contenido publicado (la verificación de sha256 protege la integridad *entre* jobs, no contra un build comprometido), con el mismo límite que el punto 1. No obtiene el token.
4. **El paquete `aws-cdk` corre con el rol** en el job `infra` (como cualquier herramienta de despliegue). Mitigación: versión fijada, integridad del lockfile, `--ignore-scripts`, ningún otro paquete ejecuta código ahí.
5. **Recursos fijados por ID.** Crear o reemplazar la distribución, el OAC o la política de cabeceras exige a una persona (y actualizar `config/staging.json`). Es intencional; está en `infra/README.md` («Recrear el stack del sitio…»).
6. **Supuestos no verificables sin desplegar**, que el runbook verifica en su orden (pasos c y d): que CloudFormation envía `aws:SourceAccount` al asumir el rol de ejecución, que las acciones de S3/SNS/Budgets listadas cubren las actualizaciones que hacen los *handlers*, y que CloudFront acepta quitar las cinco cabeceras. Si alguno falla, CloudFormation revierte solo y el runbook indica cómo corregir.
7. **El ruleset de `main` no exige aprobaciones** y el environment `landing-staging` no tiene revisores obligatorios. La confianza OIDC ya no depende de esa configuración para la rama (el `sub` exige `refs/heads/main`), pero la revisión humana sigue sin estar forzada.

## Alternativas consideradas

1. **Reutilizar los stacks de la plataforma.** Descartada: acopla ciclos de vida y amplía el radio de impacto.
2. **Un solo stack con el rol OIDC dentro.** Descartada: el workflow podría modificar su propia confianza.
3. **Usuario IAM con llaves en secretos de GitHub.** Descartada: credencial de larga duración (REQ-A11).
4. **Bootstrap propio (qualifier dedicado) con `--cloudformation-execution-policies` acotadas.** Descartada: sigue creando roles `lookup` (`ReadOnlyAccess`) y `file-publishing` que habría que acotar a mano, más un `cdk bootstrap` en una cuenta compartida; `CliCredentialsStackSynthesizer` evita todos esos roles con menos piezas.
5. **Permissions boundary sobre el `cfn-exec-role` del bootstrap.** Descartada: es un rol compartido por otros proyectos; cambiarlo rompe sus despliegues.
6. **`distribution/*` en el rol de ejecución.** Descartada: permitiría reescribir o borrar las distribuciones de los otros tres proyectos de la cuenta.

## Consecuencias

- La migración desde el modelo anterior es un procedimiento humano en seis pasos (`infra/README.md`, «Runbook de migración»): identidad → `sub` OIDC → sitio con el rol admin por última vez (para borrar la política IAM antigua) → sitio con el rol acotado (re-asociación) → variable `AWS_CFN_EXEC_ROLE_ARN` → merge.
- Un cambio de la plantilla del sitio que necesite permisos nuevos (otro tipo de recurso, o una propiedad no usada como CORS o replicación) falla con `AccessDenied` hasta que una persona amplíe el rol de ejecución en el stack de identidad. Es el comportamiento buscado.
- Orden de retiro: primero el stack del sitio (persona, con un rol de administración), luego el de identidad (desactivando antes su protección de terminación).

## Requisitos relacionados

REQ-O06 · REQ-A11 · REQ-A12 · REQ-C13

## Evidencia

- `infra/lib/delivery-identity-stack.ts`, `infra/lib/landing-site-stack.ts`, `infra/lib/landing-app.ts`, `infra/lib/names.ts`, `infra/lib/nag.ts`.
- Pruebas (vitest + cdk-nag, con arrays exactos):
  - `infra/test/delivery-identity-stack.test.ts`: confianza exacta (tres `sub`), acciones exactas de cada política, condiciones `cloudformation:RoleArn` e `iam:PassedToService`, ausencia de `sts:AssumeRole` y de IAM en el rol de ejecución, Denies explícitos, IDs de CloudFront desde la configuración.
  - `infra/test/landing-site-stack.test.ts`: sin recursos `AWS::IAM::*`, cabeceras quitadas, prefijo de nombres del que dependen las políticas.
  - `infra/test/app.test.ts`: sintetizador CLI con el bucket propio y sin dependencia del bootstrap; tabla exacta de supresiones de cdk-nag, cada una con hallazgo real.
- Mutaciones (2026-10-01): 20 regresiones inyectadas (p. ej. permitir `sts:AssumeRole` o `UpdateStack`, quitar la condición `RoleArn`, `distribution/*`, `CreateDistribution`, volver al `DefaultStackSynthesizer`, reaparecer una política IAM en el sitio); las 20 rompen la suite.
- Simulación de políticas (`aws iam simulate-custom-policy` sobre las plantillas sintetizadas, 2026-10-01): 57 casos, todos con la decisión esperada.
- Workflows: `actionlint` 1.7.12 sin hallazgos; verificación de sha256 probada con GNU coreutils 9.4 (archivo alterado, archivo extra, archivo faltante, lista reescrita y digest erróneo: todos rechazados).
- Antes de la migración, `aws iam simulate-principal-policy` sobre el rol desplegado devuelve `allowed` para `sts:AssumeRole` sobre `cdk-hnb659fds-deploy-role` (H2 vigente); tras el paso f del runbook debe devolver `explicitDeny`.
- **Verificación en vivo (2026-10-01, migración ejecutada):** `docs/evidence/live/security-hardening.md` — registro de los pasos a–f, simulación de políticas sobre lo desplegado (13/13 como se esperaba; `sts:AssumeRole` sobre `cdk-hnb659fds-deploy-role` y `cdk-hnb659fds-cfn-exec-role` = `explicitDeny`), CloudTrail (solo `AssumeRoleWithWebIdentity`, 0 `AssumeRole` sobre roles `cdk-hnb659fds-*`), cabeceras del borde, gobernanza de GitHub y riesgos residuales. Despliegue completo por la cadena acotada: run `36920298884`, release `deploy-3-7c618b7`, todos los jobs verdes, smoke 10/10.
