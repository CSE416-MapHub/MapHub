import style from './Discover.module.scss';
import SearchIcon from '@mui/icons-material/Search';

export default function () {
  return (
    <div className={style['search-container']}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
        }}
      >
        <SearchIcon />
        <input type="text" className={style['search-input']} />
      </div>
    </div>
  );
}
