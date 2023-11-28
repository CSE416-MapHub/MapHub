'use client';

import { useState } from 'react';
import style from './Discover.module.scss';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import PostAPI from 'api/PostAPI';

interface SearchBarProps {
  onSearch: (searchValue: string) => void;
  searchResponse: any;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, searchResponse }) => {
  const [searchBar, setSearchBar] = useState<string>('');

  const [searchSuggestions, setSearchSuggestions] = useState<[string, string][]>([
    ['113463640', 'January Arctic Fox Migrations in 2008'],
    ['114435342', 'Jumping Bug Populations in Brazil'],
    ['112345674', 'Jeromes Born in India'],
  ]);

  const [people, setPeople] = useState<[string, string][]>([
    ['1', 'Juma'],
    ['2', 'Fatima'],
    ['3', 'Irenee'],
  ]);
  const handleUpdateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    // Call the onSearch function when the search input changes
    setSearchBar(searchValue);
    onSearch(searchValue);
  };

  // Use the searchResponse data as needed
  console.log('Search Response:', searchResponse);

  return (
    // Your SearchBar component JSX
    <>
      <div className={style['search-container']}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '4px',
            zIndex: 2,
          }}
        >
          <SearchIcon />
          <input
            type="text"
            className={style['search-input']}
            value={searchBar}
            onChange={handleUpdateSearch}
            placeholder="Search for map inspiration"
          />
        </div>
        <div
          style={{
            visibility: searchBar === '' ? 'collapse' : 'visible',
          }}
          className={style['search-suggestions']}
        >
          <Divider />
          {searchSuggestions.map(([id, name]) => (
            <MenuItem key={id}>
              <ListItemIcon>
                <StarOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{name}</ListItemText>
            </MenuItem>
          ))}
          <Divider />
          <div>
            <Typography>People</Typography>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '4px',
            }}
          >
            {people.map(([id, name]) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                }}
              >
                {/* TODO: stock photos */}
                <AccountCircleIcon
                  sx={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                />
                <Typography>{name}</Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
// export default function () {
//   const [searchBar, setSearchBar] = useState<string>('');
//   const [searchSuggestions, setSearchSuggestions] = useState<
//     [string, string][]
//   >([
//     ['113463640', 'January Arctic Fox Migrations in 2008'],
//     ['114435342', 'Jumping Bug Populations in Brazil'],
//     ['112345674', 'Jeromes Born in India'],
//   ]);

//   const handleUpdateSearch = (e : any) => {
//     setSearchBar(e.target.value);
//     PostAPI.queryPosts(e.target.value)
//       .then(response => {
//         console.log(response);
//       })
//       .catch(error => {
//         console.log('Searching failed', error);
//       })
//   }

//   const [people, setPeople] = useState<[string, string][]>([
//     ['1', 'Juma'],
//     ['2', 'Fatima'],
//     ['3', 'Irenee'],
//   ]);
//   return (
//     <>
//       <div className={style['search-container']}>
//         <div
//           style={{
//             display: 'flex',
//             flexDirection: 'row',
//             gap: '4px',
//             zIndex: 2,
//           }}
//         >
//           <SearchIcon />
//           <input
//             type="text"
//             className={style['search-input']}
//             value={searchBar}
//             onChange={handleUpdateSearch}
//             placeholder="Search for map inspiration"
//           />
//         </div>
//         <div
//           style={{
//             visibility: searchBar === '' ? 'collapse' : 'visible',
//           }}
//           className={style['search-suggestions']}
//         >
//           <Divider />
//           {searchSuggestions.map(([id, name]) => (
//             <MenuItem key={id}>
//               <ListItemIcon>
//                 <StarOutlineIcon fontSize="small" />
//               </ListItemIcon>
//               <ListItemText>{name}</ListItemText>
//             </MenuItem>
//           ))}
//           <Divider />
//           <div>
//             <Typography>People</Typography>
//           </div>
//           <div
//             style={{
//               display: 'flex',
//               flexDirection: 'row',
//               gap: '4px',
//             }}
//           >
//             {people.map(([id, name]) => (
//               <div
//                 key={id}
//                 style={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   textAlign: 'center',
//                 }}
//               >
//                 {/* TODO: stock photos */}
//                 <AccountCircleIcon
//                   sx={{
//                     marginLeft: 'auto',
//                     marginRight: 'auto',
//                   }}
//                 />
//                 <Typography>{name}</Typography>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

