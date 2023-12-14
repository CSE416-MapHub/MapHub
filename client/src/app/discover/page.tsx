'use client'
import { useEffect, useState } from 'react';
import style from './page.module.scss';
import MapCard, { MapCardProps } from './ui/components/MapCard';
import SearchBar from './ui/components/SearchBar';
import PostAPI from 'api/PostAPI';
import AccountAPI from 'api/AccountAPI';


export default function () {
  const [mapCardData, setMapCardData] = useState<MapCardProps[]>([]);
  const [searchResponse, setSearchResponse] = useState<any>(null);
  const [authors, setAuthors] = useState<string[]>([]);

  useEffect(() => {
    // Fetch initial set of maps when the component mounts
    fetchMapCardData('');
  }, []);

  useEffect(() => {
    const fetchAuthors = async () => {
      const authorsArray: string[] = [];
      for (const map of mapCardData) {
        const username = await getAuthorById(map.userId);
        authorsArray.push(username);
      }
      setAuthors(authorsArray);
    };
    fetchAuthors();
  }, [mapCardData])

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

  const fetchMapCardData = (searchValue: string) => {
    // Fetch map card data based on search value
    PostAPI.queryPosts(searchValue)
      .then((response) => {
        if (response.data.success) {
          let posts = response.data.posts;
          if (searchValue === '') {
            posts.sort((a:MapCardProps, b:MapCardProps) => b.numLikes - a.numLikes)
          } else {
            posts = posts.filter((a:MapCardProps) => a.title.startsWith(searchValue));
          }
          posts = posts.slice(0, Math.min(6, posts.length));
          setMapCardData(
            posts.map((i: 
              { 
                postId: string; 
                userId: string; 
                numLikes: number; 
                title: string; 
                author: string; 
                svg: string; 
              }) => {
              return {
                id: i.postId,
                userId: i.userId,
                numLikes: i.numLikes,
                title: i.title,
                author: i.author,
                preview: i.svg,
              }
            })
          );
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
        {
        mapCardData.map((map, i) => (
          <MapCard
            key={i}
            id={map.id}
            userId={map.userId}
            numLikes={map.numLikes}
            userLiked={map.userLiked}
            title={map.title}
            author={authors[i]}
            preview={map.preview}
          />
        ))}
      </div>
    </>
  );
}
