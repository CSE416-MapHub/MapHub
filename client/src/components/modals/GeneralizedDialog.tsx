import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Button from 'components/button';
import style from 'styles/modal.module.scss';

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
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      PaperProps={{
        style: {
          minWidth: '50%',
          minHeight: '60%',
          width: 'auto',
          height: 'auto',
          overflow: 'auto',
        },
      }}
    >
      <DialogTitle>
        <Typography>{title}</Typography>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions
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
