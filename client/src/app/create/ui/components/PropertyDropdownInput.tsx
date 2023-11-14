'use client';
import { MenuItem, Select, makeStyles } from '@mui/material';
import { useState } from 'react';

export interface PropertyDropdownInputProps {
  options: Array<string>;
  selected: string;
}

export default function (props: PropertyDropdownInputProps) {
  const [selected, setSelected] = useState<string>(props.selected);

  function handleChange(v: string) {
    if (v !== '+ New Category') {
      setSelected(v);
    } else {
      // TODO: write add category handler
      alert(1);
    }
  }

  return (
    <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={selected}
      label=""
      variant="outlined"
      onChange={e => handleChange(e.target.value)}
      sx={{
        '& .MuiSelect-select': {
          paddingRight: 4,
          paddingLeft: 2,
          paddingTop: 1,
          paddingBottom: 1,
          border: 'none',
          outline: 'none',
        },
      }}
    >
      {(props.options as Array<string>).map(op => (
        <MenuItem
          //   className={style['dropdown-option']}
          key={op}
          value={op}
        >
          {op}
        </MenuItem>
      ))}
      <MenuItem value="+ New Category">+ New Category</MenuItem>
    </Select>
  );
}
