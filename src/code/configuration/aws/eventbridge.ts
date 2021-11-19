import { captureAWSv3Client } from 'aws-xray-sdk-core';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';

let client = new EventBridgeClient({ region: process.env.REGION });
if (process.env.TRACING) {
  client = captureAWSv3Client(client);
}

export const ebClient = client;
