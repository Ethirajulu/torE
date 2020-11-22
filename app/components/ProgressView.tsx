import { Progress } from 'antd';
import React, { FC } from 'react';

import styles from '../styles/Home.css';

interface PropType {
  percent: number;
  status: 'success' | 'normal' | 'exception' | 'active' | undefined;
}

const ProgressView: FC<PropType> = ({ percent, status }) => {
  return (
    <div className={styles.progress_grid}>
      <h4 className={styles.progress_text}>Progress</h4>
      <Progress percent={percent} status={status} />
    </div>
  );
};

export default ProgressView;
