'use client';
import Button from 'components/button';
import { useState } from 'react';
import DeleteAccountModal from './DeleteAccountModal';

export default function () {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  return (
    <>
      <Button variant="error" onClick={() => setModalOpen(true)}>
        Delete Account
      </Button>
      <DeleteAccountModal
        open={modalOpen}
        onClose={function (): void {
          setModalOpen(false);
        }}
        onConfirm={function (): void {
          // TODO: delete the user account
        }}
      />
    </>
  );
}
