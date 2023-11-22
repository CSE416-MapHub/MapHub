import React, { useState } from 'react';
import { TextField, Box, Grid, Typography } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import { getRecents } from '../helpers/EditorAPICalls';

// const caledoniaSVG = (
//   <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//     <circle cx="50" cy="50" r="50" />
//   </svg>
// );
const rectangSvg = (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="150" height="150" />
  </svg>
);
// const svgItems = [
//   { name: 'PieChart', map: caledoniaSVG },
//   { name: 'RectMap', map: rectangSvg },
// ];
interface RecentMapModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mapId: string) => void;
}

const RecentMapModal: React.FC<RecentMapModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [selectedMap, setSelectedMap] = useState<string>('');
  const [svgItems, setSvgItems] = useState<
    Array<{
      _id: string;
      title: string;
      png: Buffer;
    }>
  >([]);
  const handleSelectionChange = (selection: string) => {
    setSelectedMap(selection);
  };

  const handleConfirm = () => {
    onConfirm(selectedMap);
    onClose();
  };

  getRecents().then(items => {
    setSvgItems(items);
  });

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
            <Grid item xs={6} sm={4} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  height: '50%',
                  width: '50%',
                  margin: 'auto',
                }}
              >
                {rectangSvg}
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
