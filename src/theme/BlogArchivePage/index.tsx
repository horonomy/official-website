import React from 'react';
import BlogArchivePage from '@theme-original/BlogArchivePage';
import type {Props} from '@theme/BlogArchivePage';
import styles from './styles.module.css';

/** Keep the publisher's years, dates and destinations; only the repeated title band changes. */
export default function CorporateBlogArchive(props: Props): React.ReactElement {
  return <div className={styles.archive}><BlogArchivePage {...props} /></div>;
}
