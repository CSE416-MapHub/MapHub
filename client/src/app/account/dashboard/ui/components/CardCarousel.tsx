'use client';

import { IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import style from './carousel.module.scss';
import MapCard from './MapCard';

export interface CardCarouselProps {
  title: string;
  maps: Array<{
    _id: string;
    title: string;
    png: Buffer;
  }>;
  published: boolean;
}

export default function (props: CardCarouselProps) {
  const [page, setPage] = useState<number>(0);
  let leftArrow = (
    <IconButton onClick={() => setPage(page - 1)}>
      <KeyboardArrowLeftIcon sx={{ fontSize: '96px' }} />
    </IconButton>
  );
  let rightArrow = (
    <IconButton onClick={() => setPage(page + 1)}>
      <KeyboardArrowRightIcon sx={{ fontSize: '96px' }} />
    </IconButton>
  );

  if (page === 0) {
    leftArrow = <></>;
  }
  if ((page + 1) * 5 >= props.maps.length) {
    rightArrow = <></>;
  }

  const getAuthor = async() => {
    //Get owner from getMapById

    //Get username from getUserById
  }

  return (
    <div
      style={{
        padding: '2%',
      }}
    >
      <div
        style={{
          marginLeft: '10%',
        }}
      >
        <Typography variant="title">{props.title}</Typography>
      </div>

      <div className={style['carousel-cards-container']}>
        <div className={style['carousel-arrow-container']}>{leftArrow}</div>
        {props.maps
          .filter((_, i) => {
            return i >= page * 5 && i < (page + 1) * 5;
          })
          .map((map, i) => (
            <MapCard
              key={i}
              published={props.published}
              id={map._id}
              userId={'123'} //get userId
              numLikes={123}
              userLiked={false}
              title={map.title}
              author={'some author'} //get author
            />
          ))}
        <div className={style['carousel-arrow-container']}>{rightArrow}</div>
      </div>
    </div>
  );
}
