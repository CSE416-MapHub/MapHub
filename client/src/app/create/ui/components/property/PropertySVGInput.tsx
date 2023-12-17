'use client';

import { IconButton, Paper, Popover } from '@mui/material';
import { useContext, useState } from 'react';
import InterestsIcon from '@mui/icons-material/Interests';
import styles from './Property.module.scss';
import Button from 'components/button';
import NewSymbolModal from '../modals/newSymbolModal';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';

interface IPropertySVGInputProps {
  items: Array<string>;
  onChange: (val: string) => void;
}

export default function ({ items, onChange }: IPropertySVGInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openSymbolModal, setOpenSymbolModal] = useState(false);
  const editorContext = useContext(EditorContext);
  function onGridClick(symbolName: string) {
    let id = editorContext.state.selectedItem?.id;
    let map = editorContext.state.map;
    if (id === undefined || map === null) {
      return;
    }
    let oldSymbol = map.symbolsData[id].symbol;
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.SYMBOL,
        target: [editorContext.state.map_id, id, '-1'],
        payload: {
          symbol: symbolName,
        },
      },
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.SYMBOL,
        target: [editorContext.state.map_id, id, '-1'],
        payload: {
          symbol: oldSymbol,
        },
      },
    );
  }

  let parser = new DOMParser();
  const icons = items
    .map(x => x.split(`|${DELETED_NAME}|`) as [string, string])
    .filter(x => !x[0].endsWith(DELETED_NAME))
    .map(x => {
      let svgEl: HTMLElement = parser.parseFromString(
        x[1],
        'image/svg+xml',
      ).documentElement;

      // find the viewbox. if theres no viewbox, throw an error
      let viewbox = svgEl.getAttribute('viewBox');
      if (viewbox === null) {
        throw new Error('null viewbox');
      }
      let svgChildren = Array.from(svgEl.children);
      return [x[0], viewbox, svgChildren] as [string, string, HTMLElement[]];
    });
  console.log('CURRENT ICONS');
  console.log(icons);
  return (
    <>
      <IconButton
        aria-label="symbolPopover"
        id="symbolPopover"
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
      >
        <InterestsIcon />
      </IconButton>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Paper
          sx={{
            width: '196px',
            height: '230px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div className={styles['svg-grid-container']}>
            <div className={styles['svg-grid']}>
              {new Array(36).fill(0).map((_, i) => {
                if (icons[i] !== undefined) {
                  return (
                    <svg
                      key={icons[i][0] + '@index' + i}
                      className={styles['svg-grid-item']}
                      viewBox={icons[i][1]}
                      onClick={() => onGridClick(icons[i][0])}
                    >
                      {icons[i][2].map((x, i) => (
                        <g
                          key={'' + i}
                          ref={ref => ref?.appendChild(x)}
                          // fillOpacity={0}
                        ></g>
                      ))}
                    </svg>
                  );
                }
                return <div key={i} className={styles['svg-grid-item']}></div>;
              })}
            </div>
          </div>
          <Button variant="filled" onClick={() => setOpenSymbolModal(true)}>
            + New Symbol
          </Button>
        </Paper>
      </Popover>
      <NewSymbolModal
        open={openSymbolModal}
        onClose={() => setOpenSymbolModal(false)}
        // onConfirm={onConfirmSymbolModal}
      />
    </>
  );
}
