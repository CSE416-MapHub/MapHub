import CardCarousel from './ui/components/CardCarousel';
import Greeting from './ui/components/Greeting';

export default function () {
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
