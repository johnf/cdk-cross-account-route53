import * as path from 'path';

import { CustomResource, CustomResourceProvider, CustomResourceProviderRuntime, Stack } from 'aws-cdk-lib';

import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface CrossAccountRoute53RecordSetProps {
  readonly delegationRoleName: string;
  readonly delegationRoleAccount: string;
  readonly hostedZoneId: string;
  readonly resourceRecordSets: any; // Route53.ResourceRecordSet[],
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
      runtime: CustomResourceProviderRuntime.NODEJS_18_X,
    });

    const role = iam.Role.fromRoleArn(this, 'cross-account-record-set-handler-role', provider.roleArn);

    const addToPrinciplePolicyResult = role.addToPrincipalPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [delegationRoleArn],
    }));

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
