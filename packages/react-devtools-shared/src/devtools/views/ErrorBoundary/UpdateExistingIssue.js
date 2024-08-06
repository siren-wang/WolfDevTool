/* globals chrome */

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {GitHubIssue} from './githubAPI';

import * as React from 'react';
import Icon from '../Icon';
import styles from './shared.css';

export default function UpdateExistingIssue({
  gitHubIssue,
}: {
  gitHubIssue: GitHubIssue,
}): React.Node {
  const {title, url} = gitHubIssue;


  // const openExtensionsPage = () => {
    // window.open('chrome://extensions/', '_blank');
  // }

  return (
    <div className={styles.GitHubLinkRow}>
      <Icon className={styles.ReportIcon} type="bug" />
      <div className={styles.UpdateExistingIssuePrompt}>
        请进入
      </div>
      chrome://extensions
      <div className={styles.UpdateExistingIssuePrompt}>
        ，关闭 React Developer Tool 插件，然后重启控制台
      </div>
    </div>
  );
}
