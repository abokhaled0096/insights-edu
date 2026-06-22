import {message} from 'antd';

export function useMessage() {
  const [messageApi, contextHolder] = message.useMessage();
  return [messageApi, contextHolder];
}