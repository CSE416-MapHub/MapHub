'use client';

import { IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import style from './carousel.module.scss';

export interface CardCarouselProps {
  title: string;
  ids: Array<string>;
}

export default function (props: CardCarouselProps) {
  const [page, setPage] = useState<number>(0);
  let leftArrow = (
    <IconButton onClick={() => setPage(page - 1)}>
      <KeyboardArrowLeftIcon />
    </IconButton>
  );
  let rightArrow = (
    <IconButton onClick={() => setPage(page + 1)}>
      <KeyboardArrowRightIcon />
    </IconButton>
  );

  if (page === 0) {
    leftArrow = <></>;
  }
  if ((page + 1) * 5 >= props.ids.length) {
    rightArrow = <></>;
  }

  return (
    <div>
      <Typography variant="title">{props.title}</Typography>
      <div className={style['carousel-arrow-container']}>{leftArrow}</div>
      <div className={style['carousel-container']}></div>
      <div className={style['carousel-arrow-container']}>{rightArrow}</div>
    </div>
  );
}
