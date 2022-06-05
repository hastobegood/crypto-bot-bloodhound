import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { SNSClient } from '@aws-sdk/client-sns';

let client = new SNSClient({ region: process.env.REGION });
if (process.env.TRACING) {
  client = captureAWSv3Client(client as any);
}

export const snsClient = client;
