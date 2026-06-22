"use client";
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import { signOut } from 'next-auth/react';
import { LogoutOutlined } from '@ant-design/icons';

const SignOutModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState('هل أنت متأكد أنك تريد تسجيل الخروج؟');

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setModalText('سيتم تسجيل الخروج الآن...');
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
      signOut(); 
    }, 2000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <button  onClick={showModal} className='cursor-pointer'>
         
        تسجيل الخروج
      </button>
      <Modal
        title="تسجيل الخروج"
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  );
};

export default SignOutModal;