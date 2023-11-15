import Button from 'components/button';
import style from './page.module.scss';
import { Divider, Typography } from '@mui/material';
import DeleteModal from 'app/create/ui/components/modals/deleteInstance';
import DeleteAccountButton from './ui/components/DeleteAccountButton';

export default function () {
  return (
    <main className={style['hero__box']}>
      <Typography variant="headline">User Account Settings</Typography>
      <Divider sx={{ marginBottom: '8px' }} />
      <DeleteAccountButton />
    </main>
  );
}
