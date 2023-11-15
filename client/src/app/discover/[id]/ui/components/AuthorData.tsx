'use client';
import { useParams } from 'next/navigation';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Divider, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

// import { MapCardProps } from "../../../ui/components/MapCard"

export default function () {
  const params: { id: string } = useParams();

  //magically get the profile pic, title, author, num likes, and like status

  const profilePic = Buffer.from('');
  const title = 'Anglicans Down Under';
  const author = 'Jungkook';
  const numLikes = 1_500_000;
  const liked = false;

  let pfpComponent = <AccountCircleIcon fontSize="large" />;

  //TODO: buffer to pfp
  //   if (profilePic.length > 0) {
  //     pfpComponent = <img>
  //     </img>
  //   }
  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '4px',
          margin: '16px',
        }}
      >
        {pfpComponent}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            // TODO: hardcoded value
            // height: '48px',
            width: '100%',
          }}
        >
          <Typography variant="h3">{title}</Typography>
          <Typography variant="caption">Created by {author}</Typography>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
          }}
        >
          <FavoriteIcon fontSize="small" />
          <Typography variant="caption">{numLikes}</Typography>
        </div>
      </div>
      <Divider />
    </div>
  );
}
