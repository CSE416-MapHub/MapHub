'use client';
import { useEffect, useState } from 'react';
import CardCarousel from './ui/components/CardCarousel';
import Greeting from './ui/components/Greeting';
import {
  getRecentPublished,
  getRecentUnpublished,
} from '../helpers/EditorAPICalls';

export default function () {
  const [firstRender, setFirstRender] = useState(0);
  const [pms, setPMS] = useState<
    Array<{
      _id: string;
      title: string;
      png: Buffer;
    }>
  >([]);
  const [ums, setUMS] = useState<
    Array<{
      _id: string;
      title: string;
      png: Buffer;
    }>
  >([]);

  useEffect(() => {
    if (firstRender === 0) {
      getRecentPublished().then(p => {
        setPMS(
          p.map(i => {
            return {
              _id: i.postID,
              title: i.title,
              png: i.png,
            };
          }),
        );
      });
      getRecentUnpublished().then(p => {
        setUMS(p);
      });
      setFirstRender(firstRender + 1);
    }
  });

  return (
    <main>
      <Greeting />
      <CardCarousel
        title="My Published Maps"
        maps={[
          {
            _id: '1',
            title: 'map',
            png: Buffer.alloc(0),
          },
        ]}
        published={true}
      />
      <CardCarousel
        title="My Unpublished Maps"
        maps={[
          {
            _id: '1',
            title: 'map',
            png: Buffer.alloc(0),
          },
        ]}
        published={false}
      />
    </main>
  );
}
