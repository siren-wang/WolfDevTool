/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import {useContext, useEffect, useRef} from 'react';
import Icon from '../Icon';
import Button from '../Button';
import ButtonIcon from '../ButtonIcon';
import { RequestsContext } from './RequestsContext';
import styles from '../SearchInput.css';

type Props = {};

export default function RequestSearchInput(props: Props): React.Node {

  // const {
  //   selectedTabID
  // } = useContext(TreeStateContext);

  const { filterText, setFilterText } = useContext(RequestsContext);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const search = (text: string) => setFilterText(text);

  const resetSearch = () => search('');

  // $FlowFixMe[missing-local-annot]
  const handleChange = ({currentTarget}) => {
    search(currentTarget.value);
  };

    // Auto-focus search input
    useEffect(() => {
      if (inputRef.current === null) {
        return () => {};
      }
  
      const handleKeyDown = (event: KeyboardEvent) => {
        const {key, metaKey} = event;
        if (key === 'f' && metaKey) {
          if (inputRef.current !== null) {
            inputRef.current.focus();
            event.preventDefault();
            event.stopPropagation();
          }
        }
      };
  
      // It's important to listen to the ownerDocument to support the browser extension.
      // Here we use portals to render individual tabs (e.g. Profiler),
      // and the root document might belong to a different window.
      const ownerDocument = inputRef.current.ownerDocument;
      ownerDocument.addEventListener('keydown', handleKeyDown);
  
      return () => ownerDocument.removeEventListener('keydown', handleKeyDown);
    }, []);

  return (
    <div className={styles.SearchInput}>
      <Icon className={styles.InputIcon} type="search" />
      <input
        className={styles.Input}
        onChange={handleChange}
        placeholder="Filter"
        ref={inputRef}
        value={filterText}
      />
      {!!filterText && (
        <Button
          disabled={!filterText}
          onClick={resetSearch}
          title="Reset search">
          <ButtonIcon type="close" />
        </Button>
      )}
    </div>
  );
  
}

