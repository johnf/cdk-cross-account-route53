# AWS CDK Cross Account Route53

AWS [CDK](https://aws.amazon.com/cdk/) Constructs that define:
- IAM role that can be used to allow discrete Route53 Record changes
- Cross Account Record construct to create Route53 cross account Route53 records

These constructs allow you to create Route53 records where the zone exists in a separate AWS account to the Cloudformation Stack.

## Getting started

```shell
yarn add cdk-cross-account-route53
```

First create the role in the stack for the AWS account which contains the hosted zone.

```typescript
// DNS Stack
const zone = new route53.PublicHostedZone(this, 'HostedZone', {
  zoneName: 'example.com',
});

new CrossAccountRoute53Role(this, 'WebRoute53Role', {
  roleName: 'WebRoute53Role',
  assumedBy: new iam.AccountPrincipal('22222222'), // Web Stack Account
  zone,
  records: [{ domainNames: 'www.example.com' }],
 });
```

Then in the child stack create the records

```typescript
const hostedZoneId = 'Z12345'; // ID of the zone in the other account

const distribution = new cloudfront.Distribution(this, 'Distribution', {
  domainNames: ['example.com'],
});

new CrossAccountRoute53RecordSet(this, 'ARecord', {
  delegationRoleName: 'WebRoute53Role',
  delegationRoleAccount: '111111111', // The account that contains the zone and role
  hostedZoneId,
  resourceRecordSets: [{
    Name: `example.com`,
    Type: 'A',
    AliasTarget: {
      DNSName: distribution.distributionDomainName,
      HostedZoneId: 'Z2FDTNDATAQYW2', // Cloudfront Hosted Zone Id
      EvaluateTargetHealth: false,
    },
  }],
});
```

If you want to use wildcard matching on domains you can choose to not autonormalise the domains and pass in a wildcard e.g.

```typescript
new CrossAccountRoute53Role(this, 'WebRoute53Role', {
  roleName: 'WebRoute53Role',
  assumedBy: new iam.AccountPrincipal('22222222'), // Web Stack Account
  zone,
  records: [{ domainNames: '*.example.com' }],
  normaliseDomains: false,
 });
```

## CrossAccountRoute53Role

### Initializer
```typescript
new CrossAccountRoute53Role(scope: Construct, id: string, props: CrossAccountRoute53RoleProps)
```

*Parameters*

* **scope** Construct
* **id** string
* **props** CrossAccountRoute53RoleProps

### Construct Props

| Name             | Type                                   | Description |
| ----             | ----                                   | ----------- |
| roleName         | `string`                               | The role name |
| assumedBy        | `iam.IPrincipal`                       | The principals that are allowed to assume the role |
| zone             | `route53.IHostedZone`                  | The hosted zone. |
| records          | `CrossAccountRoute53RolePropsRecord[]` | The records that can be created by this role |
| normaliseDomains | `boolean`                              | Normalise the domains names as per AWS documentation (default: true) |

### CrossAccountRoute53RolePropsRecords

| Name        | Type                               | Description |
| ----        | ----                               | ----------- |
| domainNames | `string \| string[]`               | The names of the records that can be created or changed |
| types       | `route53.RecordType[]`             | The typepsof records that can be created. Default `['A', 'AAAA']` |
| actions     | `'CREATE' \| 'UPSERT' \| 'DELETE'` | The allowed actions. Default `['CREATE', 'UPSERT', 'DELETE']` |

## CrossAccountRoute53RecordSet

### Initializer
```typescript
new CrossAccountRoute53RecordSet(scope: Construct, id: string, props: CrossAccountRoute53RecordSetProps)
```

*Parameters*

* **scope** Construct
* **id** string
* **props** CrossAccountRoute53RecordSet

### Construct Props

| Name        | Type                                   | Description |
| ----        | ----                                   | ----------- |
| delegationRoleName    | `string`                     | The role name created in the account with the hosted zone |
| delegationRoleAccount | `string`                     | The account identfier of the account with the hosted zone |
| hostedZoneId          | `string`                     | The hosted zoned id |
| resourceRecordSets    | `Route53.ResourceRecordSets` | The changes to be applied. These are in the same format as taken by [ChangeResourceRecordSets Action](https://docs.aws.amazon.com/Route53/latest/APIReference/API_ResourceRecordSet.html) |

## Development Status

These constructs will stay in `v0.x.x` for a while, to allow easier bug fixing & breaking changes _if absolutely needed_.
Once bugs are fixed (if any), the constructs will be published with `v1` major version and will be marked as stable.

Only typescript has been tested.

## Development

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
