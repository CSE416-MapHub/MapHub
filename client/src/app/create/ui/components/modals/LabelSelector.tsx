import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Popover,
  List,
  MenuItem,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Radio,
} from '@mui/material';
import style from './LabelSelector.module.scss';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';

const ImportSortOptions = {
  NAMEASC: 'Name Ascending',
  NAMEDESC: 'Name Descending',
};

const ImportFilterOptions = {
  ASCII: 'ASCII',
  NONASCII: 'Non-ASCII',
  ALL: 'All',
};

interface LabelSelectorProps {
  properties: string[];
  isCheckbox: boolean;
  onSelect: (selection: string[]) => void;
  selectedOptions: Array<string>;
  setSelectedOptions: (s: Array<string>) => void;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
  properties,
  isCheckbox,
  onSelect,
  selectedOptions,
  setSelectedOptions,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedSort, setSelectedSort] = useState(ImportSortOptions.NAMEASC);
  const [selectedFilter, setSelectedFilter] = useState(ImportFilterOptions.ALL);
  const [filteredProperties, setFilteredProperties] =
    useState<string[]>(properties);
  // const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    // Sort and Filter logic
    let sortedProperties = [...properties];
    if (selectedSort === ImportSortOptions.NAMEASC) {
      sortedProperties.sort();
    } else if (selectedSort === ImportSortOptions.NAMEDESC) {
      sortedProperties.sort().reverse();
    }

    let filteredSortedProperties = sortedProperties.filter(property => {
      if (selectedFilter === ImportFilterOptions.ASCII) {
        return /^[\x00-\x7F]*$/.test(property); // ASCII characters only
      } else if (selectedFilter === ImportFilterOptions.NONASCII) {
        return !/^[\x00-\x7F]*$/.test(property); // Non-ASCII characters
      }
      return true; // All characters
    });

    setFilteredProperties(filteredSortedProperties);
  }, [selectedSort, selectedFilter, properties]);

  const handleCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    property: string,
  ) => {
    setSelectedOptions(
      (prev => {
        const newSelectedOptions = event.target.checked
          ? [...prev, property]
          : prev.filter(opt => opt !== property);
        console.log(newSelectedOptions);
        onSelect(newSelectedOptions);
        return newSelectedOptions;
      })(selectedOptions),
    );
  };

  const handleRadioChange = (property: string) => {
    let newSelection: Array<string> = [];
    if (!selectedOptions.includes(property)) {
      newSelection = [property];
    }
    setSelectedOptions(newSelection);
    onSelect(newSelection);
  };

  const handleSortIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? 'sort-filter-popover' : undefined;

  return (
    <Box style={{ padding: '1rem' }}>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h3">Built-In Map Labels</Typography>
        <Autocomplete
          value={searchInput}
          onChange={(event, newValue) => setSearchInput(newValue || '')}
          inputValue={searchInput}
          onInputChange={(event, newInputValue) =>
            setSearchInput(newInputValue)
          }
          options={properties}
          renderInput={params => {
            return (
              <TextField
                {...params}
                label="Search"
                className={style.textField}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSortIconClick}>
                        <SortIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            );
          }}
          style={{ minWidth: '40%' }}
          freeSolo
        />
      </Box>
      <Popover
        id={id}
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List>
          {Object.entries(ImportSortOptions).map(([key, value]) => (
            <MenuItem
              key={key}
              selected={selectedSort === value}
              onClick={() => {
                setSelectedSort(value);
              }}
            >
              {value}
            </MenuItem>
          ))}
          <Divider />
          {Object.entries(ImportFilterOptions).map(([key, value]) => (
            <MenuItem
              key={key}
              selected={selectedFilter === value}
              onClick={() => {
                setSelectedFilter(value);
              }}
            >
              {value}
            </MenuItem>
          ))}
        </List>
      </Popover>
      <Grid container spacing={2} className={style.gridList}>
        {filteredProperties
          .filter(prop =>
            prop.toLowerCase().includes(searchInput.toLowerCase()),
          )
          .map((property, index) => (
            <Grid item xs={4} key={index} className={style.gridItem}>
              <FormControlLabel
                style={{ height: '100%' }}
                control={
                  isCheckbox ? (
                    <Checkbox
                      checked={selectedOptions.includes(property)}
                      onChange={e => handleCheckboxChange(e, property)}
                    />
                  ) : (
                    <Radio
                      checked={
                        selectedOptions.includes(property) &&
                        selectedOptions.length === 1
                      }
                      onClick={e => handleRadioChange(property)}
                    />
                  )
                }
                label={property}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default LabelSelector;
