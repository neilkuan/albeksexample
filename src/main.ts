import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import { App, Construct, Stack, StackProps, Tags } from '@aws-cdk/core';
import * as cdk8s from 'cdk8s';
import { AwsLoadBalancePolicy, VersionsLists } from 'cdk8s-aws-load-balancer-controller';
import { MyChartV2 } from './alb-cdk8s';


export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'vpc', { maxAzs: 2 });
    const mastersRole = new iam.Role(this, 'masters-role', {
      assumedBy: new iam.AccountPrincipal(this.account),
    });
    const cluster = new eks.Cluster(this, 'cluster', {
      version: eks.KubernetesVersion.V1_18,
      vpc: vpc,
      defaultCapacity: 0,
      mastersRole: mastersRole,
      clusterName: 'my-kubernetes-cluster',
    });
    // ASG node group
    const asg = cluster.addAutoScalingGroupCapacity('nodes', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3A, ec2.InstanceSize.SMALL),
      maxCapacity: 3,
      minCapacity: 2,
      spotPrice: '0.0070',
    });
    const ASGSG = asg.node.findChild('InstanceSecurityGroup') as ec2.ISecurityGroup;
    // remove kubernetes.io/cluster/${cluster.clusterName} tag from InstanceSecurityGroup.
    Tags.of(ASGSG).remove(`kubernetes.io/cluster/${cluster.clusterName}`);

    // managed node group do not have any issue.
    //cluster.addNodegroupCapacity('manodes', {
    //  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3A, ec2.InstanceSize.SMALL),
    //  maxSize: 3,
    //});
    const serviceAccount = cluster.addServiceAccount('MyServiceAccount', {
      name: 'aws-load-balancer-controller',
    });
    AwsLoadBalancePolicy.addPolicy(VersionsLists.AWS_LOAD_BALANCER_CONTROLLER_POLICY_V2, serviceAccount);
    const myChart = new MyChartV2(new cdk8s.App(), 'MyChart', {
      clusterName: cluster.clusterName,
    });
    const addCdk8sChart = cluster.addCdk8sChart('my-chart', myChart);
    addCdk8sChart.node.addDependency(serviceAccount);

  }
}

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });

app.synth();