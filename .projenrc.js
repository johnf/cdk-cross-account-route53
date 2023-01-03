const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'John Ferlito',
  authorAddress: 'johnf@inodes.org',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-cross-account-route53',
  repositoryUrl: 'https://github.com/johnf/cdk-cross-account-route53.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();