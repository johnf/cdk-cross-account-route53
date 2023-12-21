import { SecretValue } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as r53 from 'aws-cdk-lib/aws-route53';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface DelegatedRecord {
  readonly types?: (keyof typeof r53.RecordType)[];
  readonly domains: string[];
}

export interface DelegationConfig {
  readonly zone: r53.IHostedZone;
  readonly records: DelegatedRecord[];
}

export interface CrossAccountRoute53RoleProps extends DelegationConfig {
  readonly roleName: string;
  readonly assumedBy: iam.IPrincipal;
}

export class CrossAccountRoute53Role extends Construct {

  constructor(scope: Construct, id: string, props: CrossAccountRoute53RoleProps) {
    super(scope, id);

    new iam.Role(this, 'DelegationRole', {
      roleName: props.roleName,
      assumedBy: props.assumedBy,
      inlinePolicies: {
        delegation: new iam.PolicyDocument({
          statements: buildDelegationStatements(props),
        }),
      },
    });
  }
}

export interface Route53UserProps extends DelegationConfig {
  readonly secretName: string;
}

export class Route53User extends Construct {

  constructor(scope: Construct, id: string, props: Route53UserProps) {
    super(scope, id);

    const user = new iam.User(this, 'User');

    buildDelegationStatements(props).forEach((e) => user.addToPolicy(e));

    const accessKey = new iam.AccessKey(this, 'AccessKey', {
      user,
    });

    new Secret(this, 'Secret', {
      secretName: props.secretName,
      secretObjectValue: {
        id: SecretValue.unsafePlainText(accessKey.accessKeyId),
        key: accessKey.secretAccessKey,
      },
    });
  }
}

function buildDelegationStatements(props: DelegationConfig) {
  const statements = props.records.flatMap((r) => {
    const recordStatements = [];

    recordStatements.push(new iam.PolicyStatement({
      actions: ['route53:ChangeResourceRecordSets'],
      resources: [props.zone.hostedZoneArn],
      conditions: {
        'ForAllValues:StringEquals': {
          'route53:ChangeResourceRecordSetsRecordTypes': r.types || [r53.RecordType.A, r53.RecordType.AAAA],
        },
        'ForAllValues:StringLike': {
          'route53:ChangeResourceRecordSetsNormalizedRecordNames': r.domains.map(normalizeDomain),
        },
      },
    }));

    return recordStatements;
  });

  statements.push(new iam.PolicyStatement({
    actions: ['route53:ListHostedZonesByName', 'route53:ListResourceRecordSets'],
    resources: [props.zone.hostedZoneArn],
  }));

  // Can we be more specific here?
  statements.push(new iam.PolicyStatement({
    actions: ['route53:GetChange', 'route53:ListHostedZones'],
    resources: ['*'],
  }));

  return statements;
}

function normalizeDomain(name: string) {
  return name
    .replace(/\.$/, '')
    .toLowerCase()
    .split('').map((char) => {
      if (char.match(/[a-z0-9\\*_.-]/)) {
        return char;
      }

      const octal = '000' + char.charCodeAt(0).toString(8);
      return `\\${octal.substring(octal.length - 3)}`;
    })
    .join('');
}
