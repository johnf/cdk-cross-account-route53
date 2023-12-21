const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Sven Kirschbaum',
  authorAddress: 'sven@kirschbaum.me',
  defaultReleaseBranch: 'main',
  name: '@fallobst22/cdk-cross-account-route53',
  description: 'CDK Construct to allow creation of Route 53 records in a different account',
  repositoryUrl: 'https://github.com/SvenKirschbaum/cdk-cross-account-route53',
  cdkVersion: 'v2.82.0',
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
