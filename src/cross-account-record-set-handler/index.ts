import { ChangeAction, ChangeResourceRecordSetsCommand, type ResourceRecordSet, Route53Client } from '@aws-sdk/client-route-53'; // eslint-disable-line import/no-extraneous-dependencies
import { fromTemporaryCredentials } from '@aws-sdk/credential-providers'; // eslint-disable-line import/no-extraneous-dependencies
import type { CloudFormationCustomResourceEvent } from 'aws-lambda';

interface ResourceProperties {
  AssumeRoleArn: string;
  HostedZoneId: string;
  ResourceRecordSets: string;
}

export async function handler(event: CloudFormationCustomResourceEvent) {
  const resourceProps = event.ResourceProperties as unknown as ResourceProperties;

  switch (event.RequestType) {
    case 'Create':
    case 'Update':
      return cfnEventHandler(resourceProps, false);
    case 'Delete':
      return cfnEventHandler(resourceProps, true);
  }
}

async function cfnEventHandler(props: ResourceProperties, isDeleteEvent: boolean) {
  const { AssumeRoleArn, HostedZoneId } = props;

  const credentials = fromTemporaryCredentials({
    params: {
      RoleArn: AssumeRoleArn,
      RoleSessionName: `cross-account-record-set-${Date.now()}`,
    },
  });

  const route53Client = new Route53Client({ credentials });

  const recordSets = JSON.parse(props.ResourceRecordSets) as ResourceRecordSet[];
  const Changes = recordSets.map((set) => ({
    Action: isDeleteEvent ? ChangeAction.DELETE : ChangeAction.UPSERT,
    ResourceRecordSet: set,
  }));

  const command = new ChangeResourceRecordSetsCommand({
    HostedZoneId,
    ChangeBatch: {
      Changes,
    },
  });

  await route53Client.send(command);
}
