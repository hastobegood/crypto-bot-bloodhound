import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

let client = new EventBridgeClient({ region: process.env.REGION });
if (process.env.TRACING) {
  client = captureAWSv3Client(client as any);
}

export const ebClient = client;
