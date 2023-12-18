import React, { useState, useEffect, useContext } from 'react';
import { TextField, Box, Grid, Typography } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import { getRecents, loadMapById } from '../helpers/EditorAPICalls';
import { AuthContext } from 'context/AuthProvider';
import { EditorContext } from 'context/EditorProvider';

// const caledoniaSVG = (
//   <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="50" cy="50" r="50" />
//   </svg>
// );
// const rectangSvg = (
//   <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//     <rect width="150" height="150" />
//   </svg>
// );
// const svgItems = [
//   { name: 'PieChart', map: caledoniaSVG },
//   { name: 'RectMap', map: rectangSvg },
// ];
interface RecentMapModalProps {
  open: boolean;
  onClose: () => void;
}

const RecentMapModal: React.FC<RecentMapModalProps> = ({ open, onClose }) => {
  const authContext = useContext(AuthContext);
  const editorContext = useContext(EditorContext);
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [svgItems, setSvgItems] = useState<
    Array<{
      _id: string;
      title: string;
      svg: string;
    }>
  >([]);
  const handleSelectionChange = (selection: string) => {
    setSelectedMap(selection);
  };

  useEffect(() => {
    if (authContext.state.isLoggedIn) {
      getRecents().then(items => {
        setSvgItems(
          items.map(item => {
            if (
              item.svg.includes('svg') &&
              item.svg.includes('xmlns') &&
              item.svg.includes('www.w3.org')
            ) {
              item.svg = `data:image/svg+xml;utf8,${encodeURIComponent(
                item.svg,
              )}`;
            } else {
              item.svg = `data:image/png;base64,${encodeURIComponent(
                item.svg,
              )}`;
            }

            return item;
          }),
        );
      });
    }
  }, [authContext.state.isLoggedIn]);

  const handleConfirm = () => {
    loadMapById(selectedMap).then(map => {
      map.geoJSON = JSON.parse(map.geoJSON as any as string);
      editorContext.helpers.setLoadedMap(editorContext, selectedMap, map);
      onClose();
    });
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Recent Maps"
    >
      <Box sx={{ overflowY: 'auto', maxHeight: '60vh', padding: 2 }}>
        <Grid container spacing={2}>
          {svgItems.map((item, index) => (
            <Grid
              item
              xs={6}
              sm={4}
              key={index}
              sx={{
                cursor: 'pointer',
                backgroundColor:
                  item._id === selectedMap ? '#00AFB9' : 'rgba(255,255,255,0)',
              }}
            >
              <Box
                onClick={() => {
                  handleSelectionChange(item._id);
                }}
                sx={{
                  textAlign: 'center',
                  height: '50%',
                  width: '50%',
                  margin: 'auto',
                }}
              >
                <img
                  // className={style['map-preview']}
                  src={item.svg}
                  alt={`${item.title}`}
                ></img>
                <Typography>{item.title}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </GeneralizedDialog>
  );
};

export default RecentMapModal;
