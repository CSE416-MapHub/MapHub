'use client'
import { useEffect, useState } from 'react';
import style from './page.module.scss';
import MapCard, { MapCardProps } from './ui/components/MapCard';
import SearchBar from './ui/components/SearchBar';
import PostAPI from 'api/PostAPI';


export default function () {
  const [mapCardData, setMapCardData] = useState<MapCardProps[]>([]);
  
  useEffect(() => {
    PostAPI.queryPosts('')
      .then((response) => {
        if(response.data.success) {
          setMapCardData(response.data.posts);
        }
      })
      .catch(error => {
        console.error('Error while querying posts:', error);
      })
  }, []);

  return (
    <>
      <SearchBar />
      <div className={style['card-grid']}>
        {mapCardData.map(map => (
          <MapCard
            key={map.id}
            id={map.id}
            userId={map.userId}
            numLikes={map.numLikes}
            userLiked={map.userLiked}
            title={map.title}
            author={map.author}
          />
        ))}
      </div>
    </>
  );
}
