/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import * as React from 'react';
import Icon from '../Icon';
import styles from './RequestKey.css';
import { useLocalStorage } from '../hooks';

export type Props = {
  children: (data: Object) => React$Node,
  title: string,
  localStorageName: string,
};


export default function RequestKey({ children, title, localStorageName }: Props): React.Node {

  const [collapsed, setCollapsed] =
    useLocalStorage<boolean>(localStorageName, false);

  return (
    <div className={styles.RequestKey}>
      <div className={styles.Header} onClick={() => setCollapsed(!collapsed)}>
        <Icon className={collapsed ? styles.CollapseIcon : styles.UnfoldedIcon} type="arrow" />
        {title}
      </div>
      {collapsed ? <></> : children }
    </div>
  );
}
