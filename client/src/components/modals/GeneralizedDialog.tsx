import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material'
import Button from 'components/button'
import style from 'styles/modal.module.scss'

interface GeneralizedDialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  onConfirm: () => void
}
const GeneralizedDialog: React.FC<GeneralizedDialogProps> = ({
  open,
  onClose,
  title,
  children,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Typography>{title}</Typography>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} variant='filled'>
          <Typography>Confirm</Typography>
        </Button>
        <Button onClick={onClose} variant='outlined'>
          <Typography>Cancel</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GeneralizedDialog
