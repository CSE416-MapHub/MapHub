import { Typography } from '@mui/material';
import style from './mapcard.module.scss';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface MapCardProps {
  published: boolean;
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

  const router = useRouter();
  const handleMapCardClick = () => {
    const published = props.published;

    if(published) {
      const route = '/discover/' + props.id;
      router.push(route);
    } else {
      console.log('unpublished')
      const queryId = props.id
      const route = '/create?mapid=' + queryId;
      router.push(route);
    }
  }
  return (
      <div
        className={props.published ? style['published-map-card-container'] : style['unpublished-map-card-container']}
        onClick={handleMapCardClick}
      >
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
              {props.published ? (
                <>
                  <FavoriteIcon className={style['map-icon']} fontSize="small" />
                  <Typography className={style['map-text']} variant="caption">{props.numLikes}</Typography>
                </>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
