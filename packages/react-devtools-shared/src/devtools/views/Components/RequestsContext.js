/* global chrome */

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */



import type {ReactContext} from 'shared/ReactTypes';

import * as React from 'react';
import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import { StoreContext } from '../context'; 
import { useSubscription } from '../hooks';
import { RequestItem } from '../../RequestsStore';

export type Context = {
  requestData: Array<RequestItem>,
  selectedRequestId: string,
  filterText: string,
  selectRequest: (value: RequestItem | null) => void,
  startRecording: () => void,
  stopRecording: () => void,
  setFilterText: (value: string) => void
};

const RequestsContext: ReactContext<Context> = createContext<Context>(null);

RequestsContext.displayName = 'RequestsContext';

type Props = {
  children: React$Node,
};


type StoreRequestState = {
  requestsData: Array<RequestItem>
};

function RequestsContextController({children}: Props): React.Node {
  const store = useContext(StoreContext);
  const {requestsStore} = store;

  // const requestData = requestsStore.requestsData;

  const [selectedRequestId, selectRequest] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');

  const startRecording = useCallback(() => {
    requestsStore.startRecording();
  }, [requestsStore]);

  const stopRecording = useCallback(
    () => requestsStore.stopRecording(),
    [requestsStore],
  );

  const subscription = useMemo(
    () => ({
      getCurrentValue: () => ({
        requestData: requestsStore.requestsData,
      }),
      subscribe: (callback: Function) => {
        requestsStore.addListener('startRecording', callback);
        return () => {
          requestsStore.removeListener('startRecording', callback);
        };
      },
    }),
    [requestsStore, store],
  );
  const {
    requestData
  } = useSubscription<StoreRequestState>(subscription);

  const value = useMemo<Context>(
    () => ({
      requestData,
      selectedRequestId,
      selectRequest,
      filterText,
      setFilterText,
      startRecording,
      stopRecording,
    }),
    [
      requestData,
      selectedRequestId,
      selectRequest,
      filterText,
      setFilterText,
      startRecording,
      stopRecording,
    ]
  );

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

export {RequestsContext, RequestsContextController};
