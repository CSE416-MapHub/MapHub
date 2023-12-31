'use client';

import { useEffect, useState, useContext } from 'react';
import CardCarousel from './ui/components/CardCarousel';
import Greeting from './ui/components/Greeting';
import {
  getRecentPublished,
  getRecentUnpublished,
} from '../helpers/EditorAPICalls';
import { AuthContext } from 'context/AuthProvider';

export default function () {
  const [firstRender, setFirstRender] = useState(0);
  const authContext = useContext(AuthContext);
  const [pms, setPMS] = useState<
    Array<{
      _id: string;
      title: string;
      userId: string;
      numLikes: number;
      svg: string;
    }>
  >([]);
  const [ums, setUMS] = useState<
    Array<{
      _id: string;
      title: string;
      userId: string;
      numLikes: number;
      svg: string;
    }>
  >([]);

  useEffect(() => {
    if (firstRender === 0 && authContext.state.isLoggedIn) {
      console.log(authContext.state);
      getRecentPublished(
        authContext.state.user?.id ? authContext.state.user?.id : '',
      ).then(p => {
        console.log(p);
        setPMS(
          p.map(i => {
            return {
              _id: i.postID,
              title: i.title,
              userId: authContext.state.user?.id
                ? authContext.state.user?.id
                : '',
              numLikes: i.numLikes,
              svg: i.svg,
            };
          }),
        );
      });
      getRecentUnpublished().then(p => {
        let unpublishedMaps: {
          _id: string;
          title: string;
          userId: string;
          numLikes: number;
          svg: string;
        }[] = [];
        p.forEach(map => {
          console.log(map);
          if (!map.published) {
            unpublishedMaps.push({
              _id: map._id,
              title: map.title,
              userId: map.owner,
              numLikes: 0,
              svg: map.svg,
            });
          }
        });
        console.log(unpublishedMaps);
        setUMS(unpublishedMaps);
      });
      setFirstRender(firstRender + 1);
    }
  }, [authContext.state.isLoggedIn === true]);

  return (
    <main>
      <Greeting />
      <CardCarousel title="My Published Maps" maps={pms} published={true} />
      <CardCarousel title="My Unpublished Maps" maps={ums} published={false} />
    </main>
  );
}
