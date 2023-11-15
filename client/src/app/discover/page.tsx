import style from './page.module.scss';
import MapCard from './ui/components/MapCard';
import SearchBar from './ui/components/SearchBar';

export default function () {
  return (
    <>
      <SearchBar />
      <div className={style['card-grid']}>
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={12}
          userLiked={false}
          title={'GDP of the US'}
          author={'AntoninScallia'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={10023}
          userLiked={false}
          title={'FREE ROBUX!! '}
          author={'user57'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={7}
          userLiked={false}
          title={'Global Views on Russia'}
          author={'Kompromat'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={12}
          userLiked={false}
          title={'Anglicans Down Under'}
          author={'HolyAussie93'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={12}
          userLiked={false}
          title={'Africa Template'}
          author={'MvembaANzinga'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={12332}
          userLiked={false}
          title={'Fatal Lightning Strikes in the US'}
          author={'Alaaaaaaaan'}
        />
        <MapCard
          id={'1'}
          userId={'1'}
          numLikes={Infinity}
          userLiked={false}
          title={'some title'}
          author={'some user'}
        />
      </div>
    </>
  );
}
