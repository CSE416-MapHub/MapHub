import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import Button from 'components/button';
import style from './modal.module.scss';

interface GeneralizedDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
}
const GeneralizedDialog: React.FC<GeneralizedDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onConfirm,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      classes={{ paper: style.dialogMain }}
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
    >
      <DialogTitle className={style.dialogGeneral} variant="h2">
        {title}
      </DialogTitle>

      {/* <Divider className={style.divider} /> */}
      <DialogContent className={style.dialogGeneral}>{children}</DialogContent>
      <DialogActions
        className={style.dialogGeneral}
        style={{
          display: 'flex',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Button onClick={onConfirm} variant="filled">
          <Typography>Confirm</Typography>
        </Button>
        <Button onClick={onClose} variant="outlined">
          <Typography>Cancel</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneralizedDialog;
