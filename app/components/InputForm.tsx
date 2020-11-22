import { Button, Input, Space } from 'antd';
import React, { FC, useState } from 'react';
import { RightOutlined } from '@ant-design/icons';

import styles from '../styles/Home.css';

interface PropType {
  onSubmit: (uri: string) => void;
}

const InputForm: FC<PropType> = ({ onSubmit }) => {
  const [uri, setUri] = useState<string>('');
  return (
    <div className={styles.input_grid}>
      <Space direction="horizontal">
        <Input
          className={styles.input}
          placeholder="Magnet URI"
          onChange={(e) => setUri(e.target.value)}
        />
        <Button
          type="text"
          className={styles.button}
          icon={<RightOutlined />}
          onClick={() => onSubmit(uri)}
        >
          GO
        </Button>
      </Space>
    </div>
  );
};

export default InputForm;
