import style from './page.module.scss';
import MapCard from './ui/components/MapCard';
import SearchBar from './ui/components/SearchBar';

export default function () {
  return (
    <>
      <SearchBar />
      <div className={style['card-grid']}>
        <MapCard />
        <MapCard />
        <MapCard />
        <MapCard />
      </div>
    </>
  );
}
