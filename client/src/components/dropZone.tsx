'use client';

import clsx from 'clsx';
import { Typography } from '@mui/material';
import { forwardRef, useState, DragEventHandler, HTMLAttributes } from 'react';

import Button from 'components/button';
import Icon from 'components/icon';

import styles from 'styles/dropZone.module.scss';

interface DropZoneProps extends HTMLAttributes<HTMLDivElement> {
  inputId?: string;
  accept?: string;
  multiple?: boolean;
  onDrop?: DragEventHandler;
}

function DropZone({
  className,
  inputId,
  accept,
  multiple,
  children,
  onDrop,
  onChange,
  ...props
}: DropZoneProps) {
  const [isDragOver, setDragOver] = useState(false);
  const handleDragEnter: DragEventHandler = event => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragOver: DragEventHandler = event => {
    event.preventDefault();
  };

  const handleDrop: DragEventHandler = event => {
    event.preventDefault();

    onDrop ? onDrop(event) : undefined;

    setDragOver(false);
  };

  const handleDragExit: DragEventHandler = event => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <div
      className={`${clsx({
        [styles['dropzone__container']]: true,
        [styles['dropzone__container--dragover']]: isDragOver,
      })} ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragExit}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      {...props}
    >
      <Icon
        className={styles['dropzone__icon']}
        type="solid"
        name="cloud-upload"
      />
      <Typography variant="headlineSmall">
        {`Drag and Drop to Upload`}
      </Typography>
      <Typography variant="bodyMedium">{children}</Typography>
      <div className={styles['dropzone__buttons']}>
        <Button
          variant="text"
          component={forwardRef((props, ref) => (
            <label
              htmlFor={inputId ? inputId : 'dropzone-input'}
              ref={ref}
              {...props}
            />
          ))}
        >
          Select Files
          <input
            id={inputId ? inputId : 'dropzone-input'}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={onChange}
            hidden
          />
        </Button>
      </div>
    </div>
  );
}

export default DropZone;
