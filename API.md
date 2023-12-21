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

| Name        | Type                                   | Description |
| ----        | ----                                   | ----------- |
| roleName    | `string`                               | The role name |
| assumedBy   | `iam.IPrincipal`                       | The principals that are allowed to assume the role |
| zone        | `route53.IHostedZone`                  | The hosted zone. |
| records     | `CrossAccountRoute53RolePropsRecord[]` | The records that can be created by this role |

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

# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### CrossAccountRoute53RecordSet <a name="CrossAccountRoute53RecordSet" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet"></a>

#### Initializers <a name="Initializers" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer"></a>

```typescript
import { CrossAccountRoute53RecordSet } from '@fallobst22/cdk-cross-account-route53'

new CrossAccountRoute53RecordSet(scope: Construct, id: string, props: CrossAccountRoute53RecordSetProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.props">props</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps">CrossAccountRoute53RecordSetProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.Initializer.parameter.props"></a>

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps">CrossAccountRoute53RecordSetProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.isConstruct"></a>

```typescript
import { CrossAccountRoute53RecordSet } from '@fallobst22/cdk-cross-account-route53'

CrossAccountRoute53RecordSet.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSet.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### CrossAccountRoute53Role <a name="CrossAccountRoute53Role" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role"></a>

#### Initializers <a name="Initializers" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer"></a>

```typescript
import { CrossAccountRoute53Role } from '@fallobst22/cdk-cross-account-route53'

new CrossAccountRoute53Role(scope: Construct, id: string, props: CrossAccountRoute53RoleProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.props">props</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps">CrossAccountRoute53RoleProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.Initializer.parameter.props"></a>

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps">CrossAccountRoute53RoleProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.isConstruct"></a>

```typescript
import { CrossAccountRoute53Role } from '@fallobst22/cdk-cross-account-route53'

CrossAccountRoute53Role.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53Role.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### Route53User <a name="Route53User" id="@fallobst22/cdk-cross-account-route53.Route53User"></a>

#### Initializers <a name="Initializers" id="@fallobst22/cdk-cross-account-route53.Route53User.Initializer"></a>

```typescript
import { Route53User } from '@fallobst22/cdk-cross-account-route53'

new Route53User(scope: Construct, id: string, props: Route53UserProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.props">props</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.Route53UserProps">Route53UserProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@fallobst22/cdk-cross-account-route53.Route53User.Initializer.parameter.props"></a>

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.Route53UserProps">Route53UserProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@fallobst22/cdk-cross-account-route53.Route53User.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@fallobst22/cdk-cross-account-route53.Route53User.isConstruct"></a>

```typescript
import { Route53User } from '@fallobst22/cdk-cross-account-route53'

Route53User.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@fallobst22/cdk-cross-account-route53.Route53User.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53User.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@fallobst22/cdk-cross-account-route53.Route53User.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### CrossAccountRoute53RecordSetProps <a name="CrossAccountRoute53RecordSetProps" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps"></a>

#### Initializer <a name="Initializer" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.Initializer"></a>

```typescript
import { CrossAccountRoute53RecordSetProps } from '@fallobst22/cdk-cross-account-route53'

const crossAccountRoute53RecordSetProps: CrossAccountRoute53RecordSetProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.delegationRoleAccount">delegationRoleAccount</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.delegationRoleName">delegationRoleName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.hostedZoneId">hostedZoneId</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.resourceRecordSets">resourceRecordSets</a></code> | <code>any</code> | *No description.* |

---

##### `delegationRoleAccount`<sup>Required</sup> <a name="delegationRoleAccount" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.delegationRoleAccount"></a>

```typescript
public readonly delegationRoleAccount: string;
```

- *Type:* string

---

##### `delegationRoleName`<sup>Required</sup> <a name="delegationRoleName" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.delegationRoleName"></a>

```typescript
public readonly delegationRoleName: string;
```

- *Type:* string

---

##### `hostedZoneId`<sup>Required</sup> <a name="hostedZoneId" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.hostedZoneId"></a>

```typescript
public readonly hostedZoneId: string;
```

- *Type:* string

---

##### `resourceRecordSets`<sup>Required</sup> <a name="resourceRecordSets" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RecordSetProps.property.resourceRecordSets"></a>

```typescript
public readonly resourceRecordSets: any;
```

- *Type:* any

---

### CrossAccountRoute53RoleProps <a name="CrossAccountRoute53RoleProps" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps"></a>

#### Initializer <a name="Initializer" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.Initializer"></a>

```typescript
import { CrossAccountRoute53RoleProps } from '@fallobst22/cdk-cross-account-route53'

const crossAccountRoute53RoleProps: CrossAccountRoute53RoleProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.records">records</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.zone">zone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.assumedBy">assumedBy</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.roleName">roleName</a></code> | <code>string</code> | *No description.* |

---

##### `records`<sup>Required</sup> <a name="records" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.records"></a>

```typescript
public readonly records: DelegatedRecord[];
```

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]

---

##### `zone`<sup>Required</sup> <a name="zone" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

---

##### `assumedBy`<sup>Required</sup> <a name="assumedBy" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.assumedBy"></a>

```typescript
public readonly assumedBy: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

---

##### `roleName`<sup>Required</sup> <a name="roleName" id="@fallobst22/cdk-cross-account-route53.CrossAccountRoute53RoleProps.property.roleName"></a>

```typescript
public readonly roleName: string;
```

- *Type:* string

---

### DelegatedRecord <a name="DelegatedRecord" id="@fallobst22/cdk-cross-account-route53.DelegatedRecord"></a>

#### Initializer <a name="Initializer" id="@fallobst22/cdk-cross-account-route53.DelegatedRecord.Initializer"></a>

```typescript
import { DelegatedRecord } from '@fallobst22/cdk-cross-account-route53'

const delegatedRecord: DelegatedRecord = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord.property.domains">domains</a></code> | <code>string[]</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord.property.types">types</a></code> | <code>string[]</code> | *No description.* |

---

##### `domains`<sup>Required</sup> <a name="domains" id="@fallobst22/cdk-cross-account-route53.DelegatedRecord.property.domains"></a>

```typescript
public readonly domains: string[];
```

- *Type:* string[]

---

##### `types`<sup>Optional</sup> <a name="types" id="@fallobst22/cdk-cross-account-route53.DelegatedRecord.property.types"></a>

```typescript
public readonly types: string[];
```

- *Type:* string[]

---

### DelegationConfig <a name="DelegationConfig" id="@fallobst22/cdk-cross-account-route53.DelegationConfig"></a>

#### Initializer <a name="Initializer" id="@fallobst22/cdk-cross-account-route53.DelegationConfig.Initializer"></a>

```typescript
import { DelegationConfig } from '@fallobst22/cdk-cross-account-route53'

const delegationConfig: DelegationConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.DelegationConfig.property.records">records</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.DelegationConfig.property.zone">zone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | *No description.* |

---

##### `records`<sup>Required</sup> <a name="records" id="@fallobst22/cdk-cross-account-route53.DelegationConfig.property.records"></a>

```typescript
public readonly records: DelegatedRecord[];
```

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]

---

##### `zone`<sup>Required</sup> <a name="zone" id="@fallobst22/cdk-cross-account-route53.DelegationConfig.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

---

### Route53UserProps <a name="Route53UserProps" id="@fallobst22/cdk-cross-account-route53.Route53UserProps"></a>

#### Initializer <a name="Initializer" id="@fallobst22/cdk-cross-account-route53.Route53UserProps.Initializer"></a>

```typescript
import { Route53UserProps } from '@fallobst22/cdk-cross-account-route53'

const route53UserProps: Route53UserProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53UserProps.property.records">records</a></code> | <code><a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53UserProps.property.zone">zone</a></code> | <code>aws-cdk-lib.aws_route53.IHostedZone</code> | *No description.* |
| <code><a href="#@fallobst22/cdk-cross-account-route53.Route53UserProps.property.secretName">secretName</a></code> | <code>string</code> | *No description.* |

---

##### `records`<sup>Required</sup> <a name="records" id="@fallobst22/cdk-cross-account-route53.Route53UserProps.property.records"></a>

```typescript
public readonly records: DelegatedRecord[];
```

- *Type:* <a href="#@fallobst22/cdk-cross-account-route53.DelegatedRecord">DelegatedRecord</a>[]

---

##### `zone`<sup>Required</sup> <a name="zone" id="@fallobst22/cdk-cross-account-route53.Route53UserProps.property.zone"></a>

```typescript
public readonly zone: IHostedZone;
```

- *Type:* aws-cdk-lib.aws_route53.IHostedZone

---

##### `secretName`<sup>Required</sup> <a name="secretName" id="@fallobst22/cdk-cross-account-route53.Route53UserProps.property.secretName"></a>

```typescript
public readonly secretName: string;
```

- *Type:* string

---



