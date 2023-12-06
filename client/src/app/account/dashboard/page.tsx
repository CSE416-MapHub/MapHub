'use client';
import { useEffect, useState, useContext } from 'react';
// TODO: make this not use client?
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
      png: Buffer;
    }>
  >([]);
  const [ums, setUMS] = useState<
    Array<{
      _id: string;
      title: string;
      userId: string;
      png: Buffer;
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
              userId: authContext.state.user?.id ? authContext.state.user?.id : '',
              png: i.png,
            };
          }),
        );
      });
      getRecentUnpublished().then(p => {
        let unpublishedMaps: {
          _id: string;
          title: string;
          userId: string;
          png: Buffer;
        }[] = [];
        p.forEach(map => {
          console.log(map);
          if(!map.published) {
            unpublishedMaps.push({
              _id: map._id,
              title: map.title,
              userId: map.owner,
              png: map.png,
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
      <CardCarousel
        title="My Published Maps"
        maps={pms}
        published={true}
      />
      <CardCarousel
        title="My Unpublished Maps"
        maps={ums}
        published={false}
      />
    </main>
  );
}
