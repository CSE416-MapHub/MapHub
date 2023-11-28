'use client'
import { useEffect, useState } from 'react';
import style from './page.module.scss';
import MapCard, { MapCardProps } from './ui/components/MapCard';
import SearchBar from './ui/components/SearchBar';
import PostAPI from 'api/PostAPI';


export default function () {
  const [mapCardData, setMapCardData] = useState<MapCardProps[]>([]);
  const [searchResponse, setSearchResponse] = useState<any>(null);

  useEffect(() => {
    // Fetch initial set of maps when the component mounts
    fetchMapCardData('');
  }, []);

  const fetchMapCardData = (searchValue: string) => {
    // Fetch map card data based on search value
    PostAPI.queryPosts(searchValue)
      .then((response) => {
        if (response.data.success) {
          setMapCardData(response.data.posts);
          setSearchResponse(response); // Set the response data to pass to SearchBar
        }
      })
      .catch((error) => {
        console.error('Error while querying or searching posts:', error);
      });
  };

  const handleSearch = (searchValue: string) => {
    // Fetch map card data based on search value
    fetchMapCardData(searchValue);
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} searchResponse={searchResponse} />
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
