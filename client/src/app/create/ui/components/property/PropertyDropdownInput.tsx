'use client';
import { MenuItem, Select, makeStyles } from '@mui/material';
import { useContext, useState } from 'react';
import NewCategoryModal from '../modals/newCategoryModal';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';

export interface PropertyDropdownInputProps {
  options: Array<string>;
  selected: string;
  onChange: (val: string) => void;
}

export default function (props: PropertyDropdownInputProps) {
  const [selected, setSelected] = useState<string>(props.selected);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const editorContext = useContext(EditorContext);

  function handleChange(v: string) {
    if (v !== '+ New Category') {
      setSelected(v);
      props.onChange(v);
    } else {
      console.log('OPENING MODAL IN AHNDLE CHANGE');
      setOpenCategoryModal(true);
    }
  }

  function onCategoryConfirm(name: string, color: string) {
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.CREATE,
        targetType: TargetType.GLOBAL_CATEGORY,
        target: [
          editorContext.state.map_id,
          editorContext.state.map!.globalCategoryData.length,
          '-1',
        ],
        payload: {
          name,
          color,
        },
      },
      {
        type: DeltaType.DELETE,
        targetType: TargetType.GLOBAL_CATEGORY,
        target: [
          editorContext.state.map_id,
          editorContext.state.map!.globalCategoryData.length,
          '-1',
        ],
        payload: {
          name,
          color,
        },
      },
    );
  }
  return (
    <>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={selected.endsWith(DELETED_NAME) ? '' : selected}
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
        {(props.options as Array<string>)
          .filter(op => !op.endsWith(DELETED_NAME))
          .map(op => (
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
      <NewCategoryModal
        open={openCategoryModal}
        onClose={() => {
          setOpenCategoryModal(false);
        }}
        onConfirm={onCategoryConfirm}
      />
    </>
  );
}
