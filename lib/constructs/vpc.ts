import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

type flowLogging = {
    enabled: boolean;
    logType: string;
    firehoseArn?: string;
    s3?: {
        bucket: IBucket;
        prefix?: string;
    };
};

export interface VpcModuleProps extends cdk.StackProps {
    projectName: string,
    vpcName: string,
    vpcCidr: string,
    maxAzs: number;
    maxNatGws?: number,
    flowLogging?: flowLogging,
    publicSubnetTags?: { [key: string]: string },
    privateSubnetTags?: { [key: string]: string },
    isolatedSubnetTags?: { [key: string]: string },
    karpenterTag?: {
        enabled: boolean,
        eksClusterName: string
    },
    tags: { [key: string]: string },
}

export class VpcModule extends Construct {

    public readonly vpc: ec2.IVpc;
    public readonly transitGateway: ec2.CfnTransitGateway;

    constructor(scope: Construct, id: string, props: VpcModuleProps) {
        super(scope, id);

        const fullName = `${props.projectName}-${props.vpcName}`;

        // 데이터 소스 및 가용 영역 가져오기
        const availabilityZones = cdk.Stack.of(this).availabilityZones;
        const azNames = props.maxAzs ? availabilityZones.slice(0, props.maxAzs) : availabilityZones;

        const vpc = new ec2.Vpc(this, `VPC-${fullName}`, {
            ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
            maxAzs: props.maxAzs || azNames.length,
            natGateways: props.maxNatGws || azNames.length,
            subnetConfiguration: [
                {
                    cidrMask: 24,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                    mapPublicIpOnLaunch: true,
                },
                {
                    cidrMask: 24,
                    name: 'private',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
                {
                    cidrMask: 24,
                    name: 'isolation',
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                },
            ],
        });

        vpc.privateSubnets.forEach(subnet => {
           // 태그 지정 시 의존성 순환 참조 오류 발생
        });

        vpc.isolatedSubnets.forEach(subnet => {
            
        })

        // VPC Tags
        cdk.Tags.of(vpc).add('Name', fullName);

        // Flow Logs
        if (props.flowLogging?.enabled) {
            new ec2.FlowLog(this, 'FlowLog', {
                resourceType: ec2.FlowLogResourceType.fromVpc(vpc),
                destination: props.flowLogging.logType === 'CLOUD_WATCH'
                    ? ec2.FlowLogDestination.toCloudWatchLogs()
                    : props.flowLogging.logType === 'FIREHOSE'
                        ? ec2.FlowLogDestination.toKinesisDataFirehoseDestination(props.flowLogging.firehoseArn!)
                        : ec2.FlowLogDestination.toS3(props.flowLogging.s3?.bucket, props.flowLogging.s3?.prefix),
            });
        }

        // Adding common tags
        if (props.tags) {
            for (const key in props.tags) {
                cdk.Tags.of(this).add(key, props.tags[key]);
            }
        }

        new cdk.CfnOutput(this, 'VpcId', {
            value: vpc.vpcId,
            exportName: `VpcId-${fullName}`,
            description: `Created VPC id of ${fullName}.`
        });

        new cdk.CfnOutput(this, 'PublicSubnetIds', {
            value: vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
            exportName: `PublicSubnetIds-${fullName}`,
        });

        new cdk.CfnOutput(this, 'PrivateSubnetIds', {
            value: vpc.privateSubnets.map(subnet => subnet.subnetId).join(','),
            exportName: `PrivateSubnetIds-${fullName}`,
        });

        new cdk.CfnOutput(this, 'IsolatedSubnetIds', {
            value: vpc.isolatedSubnets.map(subnet => subnet.subnetId).join(','),
            exportName: `IsolatedSubnetIds-${fullName}`,
        });

        this.vpc = vpc;
    }
}