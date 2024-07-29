import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { VpcModule } from '../constructs/vpc';

export interface VpcInfo {
    vpcName: string;
    maxAzs: number;
    maxNatGws?: number;
    vpcCidr: string;
    flowLogging?: {
        enabled: boolean;
        logType: string;
    }
}

export interface NetworkStackProps extends cdk.StackProps {
    projectName: string;
    vpc: VpcInfo;
    bastion?: {
        create: boolean;
    },
    tags: { [key: string]: string };
}

export class NetworkStack extends cdk.Stack {
    public readonly vpc: ec2.Vpc;
    public readonly bastion: ec2.Instance;

    constructor(scope: Construct, id: string, props: NetworkStackProps) {
        super(scope, id, props);

        const vpcModule = new VpcModule(this, `Vpc-${props.projectName}-${props.vpc.vpcName}`, {
            projectName: props.projectName,
            vpcName: props.vpc.vpcName,
            vpcCidr: props.vpc.vpcCidr,
            maxAzs: props.vpc.maxAzs,
            maxNatGws: props.vpc.maxNatGws,
            flowLogging: props.vpc.flowLogging,
            tags: props.tags,
        });

        // Bastion instances.
        if (props.bastion?.create) {
            
        }
    }
}
