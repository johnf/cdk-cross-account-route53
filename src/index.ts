import * as path from 'node:path';
import { CustomResource, CustomResourceProvider, CustomResourceProviderRuntime, Stack } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export type CrossAccountRoute53RolePropsRecordAction = 'CREATE' | 'UPSERT' | 'DELETE';

export interface CrossAccountRoute53RolePropsRecord {
  readonly domainNames: string | string[];
  readonly types?: (keyof typeof route53.RecordType)[];
  readonly actions?: CrossAccountRoute53RolePropsRecordAction[];
}

export interface CrossAccountRoute53RoleProps {
  readonly roleName: string;
  readonly assumedBy: iam.IPrincipal;
  readonly zone: route53.IHostedZone;
  readonly records: CrossAccountRoute53RolePropsRecord[];
  readonly normaliseDomains?: boolean;
}

export class CrossAccountRoute53Role extends Construct {
  constructor(scope: Construct, id: string, props: CrossAccountRoute53RoleProps) {
    super(scope, id);

    const { roleName, assumedBy, zone, records } = props;
    const normaliseDomains = props.normaliseDomains ?? true;

    const statements = records.map((record) => {
      const domainNames = Array.isArray(record.domainNames) ? record.domainNames : [record.domainNames];

      return new iam.PolicyStatement({
        actions: ['route53:ChangeResourceRecordSets'],
        resources: [zone.hostedZoneArn],
        conditions: {
          'ForAllValues:StringEquals': {
            'route53:ChangeResourceRecordSetsRecordTypes': record.types || ['A', 'AAAA'],
            'route53:ChangeResourceRecordSetsActions': record.actions || ['CREATE', 'UPSERT', 'DELETE'],
          },
          'ForAllValues:StringLike': {
            'route53:ChangeResourceRecordSetsNormalizedRecordNames': normaliseDomains
              ? domainNames.map((domainName) => this.normaliseDomainName(domainName))
              : domainNames,
          },
        },
      });
    });

    statements.push(
      new iam.PolicyStatement({
        actions: ['route53:ListHostedZonesByName'],
        resources: [zone.hostedZoneArn],
      }),
    );

    // Can we be more specific here?
    statements.push(
      new iam.PolicyStatement({
        actions: ['route53:GetChange'],
        resources: ['*'],
      }),
    );

    new iam.Role(this, id, {
      roleName,
      assumedBy,
      inlinePolicies: {
        delegation: new iam.PolicyDocument({ statements }),
      },
    });
  }

  private normaliseDomainName(domainName: string): string {
    return domainName
      .replace(/\.$/, '')
      .toLowerCase()
      .split('')
      .map((char) => {
        if (char.match(/[a-z0-9_.-]/)) {
          return char;
        }

        const octal = `000${char.charCodeAt(0).toString(8)}`;
        return `\\${octal.substring(octal.length - 3)}`;
      })
      .join('');
  }
}

export interface CrossAccountRoute53RecordSetProps {
  readonly delegationRoleName: string;
  readonly delegationRoleAccount: string;
  readonly hostedZoneId: string;
  readonly resourceRecordSets: object[];
}

export class CrossAccountRoute53RecordSet extends Construct {
  constructor(scope: Construct, id: string, props: CrossAccountRoute53RecordSetProps) {
    super(scope, id);

    const delegationRoleArn = Stack.of(this).formatArn({
      region: '',
      service: 'iam',
      account: props.delegationRoleAccount,
      resource: 'role',
      resourceName: props.delegationRoleName,
    });

    const customResourceType = 'Custom::CrossAccountRoute53RecordSet';

    const provider = CustomResourceProvider.getOrCreateProvider(this, customResourceType, {
      codeDirectory: path.join(__dirname, 'cross-account-record-set-handler'),
      runtime: CustomResourceProviderRuntime.NODEJS_22_X,
    });

    const role = iam.Role.fromRoleArn(this, 'cross-account-record-set-handler-role', provider.roleArn);

    const addToPrinciplePolicyResult = role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [delegationRoleArn],
      }),
    );

    const customResource = new CustomResource(this, 'CrossAccountRecordSetCustomResource', {
      resourceType: customResourceType,
      serviceToken: provider.serviceToken,
      properties: {
        AssumeRoleArn: delegationRoleArn,
        HostedZoneId: props.hostedZoneId,
        ResourceRecordSets: JSON.stringify(props.resourceRecordSets),
      },
    });

    if (addToPrinciplePolicyResult.policyDependable) {
      customResource.node.addDependency(addToPrinciplePolicyResult.policyDependable);
    }
  }
}
