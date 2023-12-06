import { Typography } from '@mui/material';
import style from './Discover.module.scss';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Link from 'next/link';

export interface MapCardProps {
  id: string;
  userId: string;

  numLikes: number;
  userLiked: boolean;

  title: string;
  author: string;

  preview?: Buffer;
}

function toBase64(arr: Buffer) {
  //arr = new Uint8Array(arr) if it's an ArrayBuffer
  return btoa(arr.reduce((data, byte) => data + String.fromCharCode(byte), ''));
}

const placeholderImage =
  'https://www.react-simple-maps.io/images/basic-world-map-md.png';

export default function (props: MapCardProps) {
  let dataurl = props.preview
    ? `data:image/png;base64,${toBase64(props.preview)}`
    : placeholderImage;
  return (
    <Link
      href={`/discover/${props.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className={style['map-card-container']}>
        <img
          className={style['map-preview']}
          src={dataurl}
          alt={`${props.title} by ${props.author}`}
        ></img>
        <div className={style['map-details']}>
          <Typography className={style['map-text']}>{props.title}</Typography>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Typography className={style['map-text']} variant="caption">By {props.author}</Typography>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '4px',
              }}
            >
              <FavoriteIcon className={style['map-icon']} fontSize="small" />
              <Typography className={style['map-text']} variant="caption">{props.numLikes}</Typography>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
