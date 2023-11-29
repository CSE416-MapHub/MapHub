'use client';

import { HTMLAttributes } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

import Button from '../../../../components/button';
import styles from '../styles/settingsHead.module.scss';

interface SettingsHeadProps extends HTMLAttributes<HTMLElement> {
  back?: {
    name: string;
    href: string;
  };
  headlineId?: string;
}

function SettingsHead({
  back,
  children,
  className,
  headlineId,
  ...props
}: SettingsHeadProps) {
  const router = useRouter();
  return (
    <Box className={`${styles['settings__head']} ${className}`} {...props}>
      {back ? (
        <Button
          variant="text"
          onClick={() => {
            router.push(back.href);
          }}
        >{`← ${back.name}`}</Button>
      ) : undefined}
      <Typography id={headlineId} variant="headlineLarge">
        {children}
      </Typography>
    </Box>
  );
}

export default SettingsHead;
