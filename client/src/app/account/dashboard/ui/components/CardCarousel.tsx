'use client';

import { IconButton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import style from './carousel.module.scss';
import MapCard from './MapCard';
import AccountAPI from 'api/AccountAPI';
import { first } from 'cypress/types/lodash';

export interface CardCarouselProps {
  title: string;
  maps: Array<{
    _id: string;
    title: string;
    userId: string;
    numLikes: number;
    svg: string;
  }>;
  published: boolean;
}

export default function (props: CardCarouselProps) {
  const [page, setPage] = useState<number>(0);
  const [authors, setAuthors] = useState<string[]>([]);

  let leftArrow = (
    <IconButton onClick={() => setPage(page - 1)} disabled={page === 0}>
      <KeyboardArrowLeftIcon sx={{ fontSize: '96px' }} />
    </IconButton>
  );
  let rightArrow = (
    <IconButton onClick={() => setPage(page + 1)} disabled={(page + 1) * 5 >= props.maps.length}>
      <KeyboardArrowRightIcon sx={{ fontSize: '96px' }} />
    </IconButton>
  );

  const getAuthorById = async (id: string) => {
    try {
      const res = await AccountAPI.getUserById(id);
      const username = res.data.user.username;
      console.log(res);
      console.log(username);
      return username;
    } catch (error) {
      console.error(`Error fetching author for map ${id}:`, error);
    }
  }

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorsArray: string[] = [];
      for (const map of props.maps) {
        const username = await getAuthorById(map.userId);
        authorsArray.push(username);
      }
      setAuthors(authorsArray);
    };

    fetchAuthors();
  }, [props.maps]);

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
          .map((map, i) => {
            return (
              <MapCard
                key={i}
                published={props.published}
                id={map._id}
                userId={map.userId} 
                numLikes={props.published ? map.numLikes : 0}
                userLiked={false}
                title={map.title}
                author={authors[i]} //get author
                preview={map.svg}
              />
            )
          }
          )}
        <div className={style['carousel-arrow-container']}>{rightArrow}</div>
      </div>
    </div>
  );
}
