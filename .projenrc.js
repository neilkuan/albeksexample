const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.82.0',
  name: 'albeksexample',
  cdkVersionPinning: true,
  cdkDependencies: [
    '@aws-cdk/aws-eks',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-iam',
  ],
  deps: [
    'cdk8s-aws-load-balancer-controller',
    'cdk8s',
    'cdk8s-plus',
    'constructs',
  ],
});

project.synth();
