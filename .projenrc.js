const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'John Ferlito',
  authorAddress: 'johnf@inodes.org',
  cdkVersion: '2.58.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-cross-account-route53',
  description: 'CDK Construct to allow creation of Route 53 records in a different account',
  repositoryUrl: 'https://github.com/johnf/cdk-cross-account-route53.git',
  keywords: [
    'aws',
    'aws-cdk',
    'awscdk',
    'cdk',
    'route53',
    'cross-account',
    'role',
    'records',
  ],
  devDeps: ['aws-sdk'],
});
project.synth();
