import style from './page.module.scss';
import AuthorData from './ui/components/AuthorData';
import Social from './ui/components/Social';

const placeholderImage =
  'https://www.react-simple-maps.io/images/basic-world-map-md.png';

export default function Page({ params }: { params: { id: string } }) {
  //   return <div>My Post: {params.id}</div>;
  return (
    <main id={style['map-post']}>
      <img className={style['map-container']} src={placeholderImage}></img>
      <Social />
    </main>
  );
}
