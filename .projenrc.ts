import { awscdk, javascript } from 'projen';

const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-cross-account-route53',
  author: 'John Ferlito',
  authorAddress: 'johnf@inodes.org',
  description: 'CDK Construct to allow creation of Route 53 records in a different account',
  repositoryUrl: 'https://github.com/johnf/cdk-cross-account-route53.git',
  keywords: ['aws', 'aws-cdk', 'awscdk', 'cdk', 'route53', 'cross-account', 'role', 'records'],

  cdkVersion: '2.146.0',
  majorVersion: 1,
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.8.0',
  projenrcTs: true,
  devDeps: ['@aws-sdk/client-route-53', '@aws-sdk/client-sts', '@aws-sdk/credential-providers', '@types/aws-lambda'],

  packageManager: javascript.NodePackageManager.PNPM,

  python: {
    distName: 'cdk-cross-account-route53',
    module: 'cdk_cross_account_route53',
  },

  biome: true,
  biomeOptions: {
    biomeConfig: {
      formatter: {
        indentStyle: javascript.biome_config.IndentStyle.SPACE,
      },
      javascript: {
        formatter: {
          quoteStyle: javascript.biome_config.QuoteStyle.SINGLE,
          lineWidth: 160,
        },
      },
    },
  },
});

project.synth();
