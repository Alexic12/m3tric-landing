import { Aws, CfnOutput, CfnRule, Fn, RemovalPolicy, Stack, Tags, type App, type StackProps } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { AaaaRecord, ARecord, HostedZone, RecordTarget, type IAliasRecordTarget } from 'aws-cdk-lib/aws-route53';

import type { DomainConfig } from './domain-config';
import { ManualSiteBootstrapSynthesizer } from './landing-app';

export const DOMAIN_STACK_ID = 'm3tric-DomainStack';

// Fixed, global hosted zone ID that Route 53 alias records use for every CloudFront distribution.
const CLOUDFRONT_ALIAS_ZONE_ID = 'Z2FDTNDATAQYW2';

// The distributions belong to the landing and platform stacks (other deploys); only
// their domain names are known here, so a distribution construct cannot be built.
function cloudFrontAlias(distributionDomainName: string): IAliasRecordTarget {
  return { bind: () => ({ hostedZoneId: CLOUDFRONT_ALIAS_ZONE_ID, dnsName: distributionDomainName }) };
}

/** Certificate and DNS records for m3tric.io. Deployed by hand, never by deploy.yml. */
export class DomainStack extends Stack {
  public readonly certificate: Certificate;

  public constructor(scope: App, config: DomainConfig) {
    const props: StackProps = {
      env: { account: config.account, region: config.region },
      stackName: DOMAIN_STACK_ID,
      tags: { ...config.tags },
      // Template-only: us-east-1 has no CDK bootstrap and the stack needs no assets.
      synthesizer: new ManualSiteBootstrapSynthesizer(),
    };
    super(scope, DOMAIN_STACK_ID, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'Zone', {
      hostedZoneId: config.hostedZoneId,
      zoneName: config.zoneName,
    });
    const [domainName, ...alternativeNames] = config.certificateDomains;

    // fromDns emits native DomainValidationOptions: CloudFormation writes the
    // validation CNAMEs and waits for ISSUED, so no Lambda-backed custom resource.
    this.certificate = new Certificate(this, 'Certificate', {
      domainName: domainName!,
      subjectAlternativeNames: alternativeNames,
      validation: CertificateValidation.fromDns(zone),
    });
    this.certificate.applyRemovalPolicy(RemovalPolicy.RETAIN);

    config.aliasRecords.forEach((record, index) => {
      const target = RecordTarget.fromAlias(cloudFrontAlias(record.distributionDomainName));
      new ARecord(this, `Alias${index}A`, { zone, recordName: record.name, target });
      new AaaaRecord(this, `Alias${index}Aaaa`, { zone, recordName: record.name, target });
    });

    for (const [key, value] of Object.entries(config.tags)) Tags.of(this).add(key, value);

    new CfnRule(this, 'ExpectedTarget', { assertions: [
      { assert: Fn.conditionEquals(Aws.ACCOUNT_ID, config.account), assertDescription: 'EAFIT account is required' },
      { assert: Fn.conditionEquals(Aws.REGION, config.region), assertDescription: 'N. Virginia region is required' },
    ] });

    new CfnOutput(this, 'CertificateArn', { value: this.certificate.certificateArn });
    new CfnOutput(this, 'DomainNames', { value: config.aliasRecords.map((record) => record.name).join(',') });
  }
}
