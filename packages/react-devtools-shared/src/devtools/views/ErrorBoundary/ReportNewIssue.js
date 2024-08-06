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
import {searchGitHubIssuesURL} from './githubAPI';
import styles from './shared.css';

const LABELS = [
  'Component: Developer Tools',
  'Type: Bug',
  'Status: Unconfirmed',
];

// This must match the filename in ".github/ISSUE_TEMPLATE/"
const TEMPLATE = 'devtools_bug_report.yml';

type Props = {
  callStack: string | null,
  componentStack: string | null,
  errorMessage: string | null,
};

export default function ReportNewIssue({
  callStack,
  componentStack,
  errorMessage,
}: Props): React.Node {
  // let bugURL = process.env.GITHUB_URL;
  const bugURL = `https://tt.sankuai.com/ticket/create?cid=46&tid=648`;

  return (
    <div className={styles.GitHubLinkRow}>
      <Icon className={styles.ReportIcon} type="bug" />
      <a
        className={styles.ReportLink}
        href={bugURL}
        rel="noopener noreferrer"
        target="_blank"
        title="Report bug">
        TT
      </a>
      <div className={styles.ReproSteps}>
        (Please include steps on how to reproduce it and the components used.)
      </div>
    </div>
  );
}
