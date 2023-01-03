import * as cdk from 'aws-cdk-lib';
import { Capture, Template } from 'aws-cdk-lib/assertions';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { CrossAccountRoute53Role, CrossAccountRoute53RoleProps } from '../lib/index';

test('Role Created (defaults)', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  const props: CrossAccountRoute53RoleProps = {
    roleName: 'TestRole',
    assumedBy: new iam.AccountPrincipal('123456789012'),
    zone: new route53.HostedZone(stack, 'HostedZone', { zoneName: 'inodes.org' }),
    records: [
      { domainNames: 'test.inodes.org' },
    ],
  };

  new CrossAccountRoute53Role(stack, 'MyTestConstruct', props);

  const template = Template.fromStack(stack);
  const policies = new Capture();
  // const assumedBy = new Capture();

  template.hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'TestRole',
    Policies: policies,
    // AssumeRolePolicyDocument: assumedBy,
  });
  // console.debug(assumedBy.asString());

  const policy = policies.asArray()[0];
  const statements = policy.PolicyDocument.Statement;

  const recordStatement = statements.find((statement: any) => statement.Action === 'route53:ChangeResourceRecordSets');

  expect(recordStatement).toBeDefined();
  const condition = recordStatement.Condition;
  expect(condition).toBeDefined();

  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsRecordTypes']).toEqual(['A', 'AAAA']);
  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsActions']).toEqual(['CREATE', 'UPSERT', 'DELETE']);
  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsNormalizedRecordNames']).toEqual(['test.inodes.org']);
});

test('Role Created (custom)', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');

  const props: CrossAccountRoute53RoleProps = {
    roleName: 'TestRole',
    assumedBy: new iam.AccountPrincipal('123456789012'),
    zone: new route53.HostedZone(stack, 'HostedZone', { zoneName: 'inodes.org' }),
    records: [
      { domainNames: 'test%.inodes.org.', types: ['TXT'], actions: ['UPSERT'] },
    ],
  };

  new CrossAccountRoute53Role(stack, 'MyTestConstruct', props);

  const template = Template.fromStack(stack);
  const policies = new Capture();
  // const assumedBy = new Capture();

  template.hasResourceProperties('AWS::IAM::Role', {
    RoleName: 'TestRole',
    Policies: policies,
    // AssumeRolePolicyDocument: assumedBy,
  });
  // console.debug(assumedBy.asString());

  const policy = policies.asArray()[0];
  const statements = policy.PolicyDocument.Statement;

  const recordStatement = statements.find((statement: any) => statement.Action === 'route53:ChangeResourceRecordSets');

  expect(recordStatement).toBeDefined();
  const condition = recordStatement.Condition;
  expect(condition).toBeDefined();

  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsRecordTypes']).toEqual(['TXT']);
  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsActions']).toEqual(['UPSERT']);
  expect(condition['ForAllValues:StringEquals']['route53:ChangeResourceRecordSetsNormalizedRecordNames']).toEqual(['test\\045.inodes.org']);
});
