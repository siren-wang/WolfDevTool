/* global chrome */

import EventEmitter from '../events';
import Store from './store';

import type {FrontendBridge} from 'react-devtools-shared/src/bridge';

export type Header = { name: string, value: string};

export type RequestItem = {
  request: {
    bodySize: number,
    cookies: Array<any>,
    headers: string,
    method: "POST" | "GET",
    name: string,
    url: string,
    queryString: Array<Header>,
  },
  response: {
    body: string,
    bodySize: number,
    content: any,
    headers: Array<Header>,
    wolfProxyUrl?: string,
    headersSize: number,
    status: number,
    statusText: "OK"
  },
  wolfProxyHeaders: any,
  id: string
};

type RequestsData = Array<RequestItem>


export default class RequestsStore extends EventEmitter {

  _bridge: FrontendBridge;

  _isRecording: boolean = false;

  _requestsData: RequestsData = [];

  _store: Store;

  constructor(
    bridge: FrontendBridge,
    store: Store,
    defaultIsRecording: boolean,
  ) {
    super();

    this._bridge = bridge;
    this._isRecording = defaultIsRecording;
    this._store = store;
    this._requestsData = []

    bridge.addListener('startRecording', this.startRecording);
  }

  get isRecording(): boolean {
    return this._isRecording;
  }

  get requestsData(): RequestsData {
    return this._requestsData;
  }

  clear(): void {
    this._requestsData = [];
  }

  recordlistenerCallback = (requestInfo) => {
    if (!requestInfo._resourceType || requestInfo._resourceType === 'fetch' || requestInfo._resourceType === 'xhr') {
      const request = { ...requestInfo.request };
      if (!request.url.includes('wolf')) return;

      const urlPieces = request.url.split('/')
      request.name = urlPieces[urlPieces.length - 1] || urlPieces[urlPieces.length - 2] + '/'
      // let requestHeaders = ''
      // request.headers.sort((a, b) => a.name.localeCompare(b.name)).forEach(header => {
      //     requestHeaders += `${header.name}: ${header.value}\n`
      // })
      // request.headers = requestHeaders

      const response = { ...requestInfo.response };
      requestInfo?.getContent(body => {
        response.body = body
      });

      const wolfProxyHeaders = response.headers
        .filter(header => header.name.includes('WOLF-PROXY'))
        .reduce((headersObj, header) => {
          headersObj[header.name] = header.value;
          return headersObj;
        }, {});

      const data = { request, response, wolfProxyHeaders, id: Math.random().toString(36).slice(2) }

      this._requestsData.push(data)
    }
  }

  startRecording(): void {
    chrome.devtools.network.onRequestFinished.addListener(this.recordlistenerCallback);
  }

  stopProfiling(): void {
    chrome.devtools.network.onRequestFinished.removeListener(this.recordlistenerCallback)
  }

}
