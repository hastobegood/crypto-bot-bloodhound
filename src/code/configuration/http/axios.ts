import http from 'http';
import https from 'https';

import { captureHTTPsGlobal, capturePromise, setContextMissingStrategy } from 'aws-xray-sdk-core';
import axios from 'axios';

if (process.env.TRACING) {
  setContextMissingStrategy('LOG_ERROR');
  captureHTTPsGlobal(http);
  captureHTTPsGlobal(https);
  capturePromise();
}

export const axiosInstance = axios.create({
  timeout: 5000,
});
