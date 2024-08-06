/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import { Fragment, useContext, useState } from 'react';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import Icon from '../Icon';
import styles from './InspectedRequest.css';

import { RequestsContext } from './RequestsContext';
import TabBar from '../TabBar';
import RequestKey from './RequestKey';
import { LOCAL_STORAGE_NETWORK_GENERAL, LOCAL_STORAGE_NETWORK_REQUEST_HEADERS, LOCAL_STORAGE_NETWORK_RESPONSE_HEADERS } from '../../../constants';
import RequestEditor, { RequestJsonEditor } from './RequestEditor';
import { isJson, jsonBeautify } from './utils';

export type Props = {};

type TabID = 'headers' | 'payload' | 'preview';

const tabs = [
  {
    id: 'headers',
    label: 'Headers',
    title: 'Headers'
  },
  {
    id: 'payload',
    label: 'Payload',
    title: 'Payload'
  },
  {
    id: 'preview',
    label: 'Preview',
    title: 'Response preview',
  },
];

export default function InspectedRequest(_: Props): React.Node {
  const { selectedRequestId, requestData } = useContext(RequestsContext);

  const selectedRequest = requestData.find(({ id }) => id === selectedRequestId);

  const [selectedTabID, selectTab] = useState<TabID>('Headers');

  console.log('selectedRequest', selectedRequest);

  if (!selectedRequest) {
    return (
      <div className={styles.InspectedRequestWrapper}>
        <div className={styles.TitleRow} />
      </div>
    );
  }

  return (
    <div className={styles.InspectedRequestWrapper}>
      <div className={styles.TitleRow}>
        <TabBar
          currentTab={selectedTabID}
          id="Profiler"
          selectTab={selectTab}
          tabs={tabs}
          type="naviTab"
        />
      </div>
      <div className={styles.InspectedRequest}>
        {
          selectedTabID === 'headers'
          && (
            <Fragment>
              <RequestKey title="General" localStorageName={LOCAL_STORAGE_NETWORK_GENERAL}>
                <div className={styles.General}>
                  <div className={styles.keyValue}>
                    <div>Request URL:</div>
                    <div>{selectedRequest.request.url}</div>
                  </div>
                  <div className={styles.keyValue}>
                    <div>Request Method:</div>
                    <div>{selectedRequest.request.method}</div>
                  </div>
                  <div className={styles.keyValue}>
                    <div>Status Code:</div>
                    <div>{selectedRequest.response.status}</div>
                  </div>
                </div>
              </RequestKey>
              <RequestKey title="Response Headers" localStorageName={LOCAL_STORAGE_NETWORK_RESPONSE_HEADERS}>
                <RequestEditor
                  request={selectedRequest.response.headers}
                />
              </RequestKey>
              <RequestKey title="Request Headers" localStorageName={LOCAL_STORAGE_NETWORK_REQUEST_HEADERS}>
                <RequestEditor
                  request={selectedRequest.request.headers}
                />
              </RequestKey>
            </Fragment>
          )
        }
        {
          selectedTabID === 'payload'
          && (
            <Fragment>
              <RequestKey title="Query String Parameters">
                <RequestEditor
                  request={selectedRequest.request.queryString}
                />
              </RequestKey>
              {
                selectedRequest.request.postData
                && <RequestKey title="Request Payload">
                    <RequestJsonEditor
                      content={selectedRequest.request.postData.text}
                    />
                </RequestKey>
              }
            </Fragment>
          )
        }
        {
          selectedTabID === 'preview'
          && (
            <Fragment>
              {
                isJson(selectedRequest.response.body)
                ? <span
                    dangerouslySetInnerHTML={{ __html: jsonBeautify(JSON.stringify(JSON.parse(selectedRequest.response.body), null, 4)) }}
                ></span>
                : selectedRequest.response.body
              }
            </Fragment>
          )
        }
      </div>
    </div>
  );
}
