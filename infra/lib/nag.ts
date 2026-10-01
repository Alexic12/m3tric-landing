import { Validations } from 'aws-cdk-lib';
import type { IConstruct } from 'constructs';

/**
 * Acknowledges ONE cdk-nag finding (e.g. `AwsSolutions-IAM5[Resource::<arn>]`) on
 * `scope`, by writing the same `aws:cdk:acknowledged-rules` metadata that
 * `Validations.of(scope).acknowledge()` writes.
 *
 * Why not `acknowledge()`: aws-cdk-lib 2.267 rejects ids containing more than one
 * `::`, and every S3 ARN (`arn:aws:s3:::`) and Budgets ARN (`arn:aws:budgets::`)
 * contains one, so a finding on those resources could otherwise only be hidden by
 * a broader suppression. Both consumers match the raw key exactly: cdk-nag 3.0.2
 * (`NagPack.isAcknowledged`) and CDK's synthesis validation, which looks up rule
 * names containing `::` verbatim. test/app.test.ts proves each one hides a real
 * finding and nothing else.
 */
export function acknowledgeFinding(scope: IConstruct, findingId: string, reason: string): void {
  scope.node.addMetadata(Validations.ACKNOWLEDGED_RULES_METADATA_KEY, { [findingId]: reason });
}
