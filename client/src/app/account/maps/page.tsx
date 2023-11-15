import CardCarousel from './ui/components/CardCarousel';
import Greeting from './ui/components/Greeting';

export default function () {
  return (
    <main>
      <Greeting pfp={Buffer.from('')} username="Michael" />
      <CardCarousel
        title="My Published Maps"
        ids={['1', '2', '3', '4', '2', '3', '4']}
      />
      <CardCarousel
        title="My Unpublished Maps"
        ids={['1', '2', '3', '4', '2', '3', '4']}
      />
    </main>
  );
}
