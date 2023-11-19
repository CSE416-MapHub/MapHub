'use client';

import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Typography,
} from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import styles from './EditorRibbon.module.scss';
import { ChangeEvent, useCallback, useContext, useRef, useState } from 'react';
import EditorMenu, { MenuProps } from './EditorMenu';
import ImportModal from './modals/importModal';
import ChoroplethModal from './modals/choroplethModal';
import MultiMapLabelModal from './modals/multiLabelModal';
import RecentMapModal from './modals/recentMapModal';
import PublishMapModal from './modals/publishModal';
import Button from 'components/button';
import { EditorActions, EditorContext } from 'context/EditorProvider';
import { buildMHJSON } from 'app/create/MHJsonBuilder';
import { DataTable } from 'dbf-reader/models/dbf-file';
import * as shp from 'shapefile';
import tj from '@mapbox/togeojson';
import { Dbf } from 'dbf-reader/dbf';

// A list of all accepted file types.
const accept: string =
  '.shp, .shx, .dbf, ' + // Shape Files
  '.json, .geojson, application/geo+json, ' + // GeoJSON Files
  '.kml, .kmz, application/vnd.google-earth.kml+xml, ' + // Keyhole Files
  'application/vnd.google-earth.kmz';

function mergeData(
  gjson: GeoJSON.GeoJSON | null,
  dbf: DataTable | null,
): GeoJSON.GeoJSON | null {
  console.log('MERGING DATA');
  console.log(gjson);
  console.log(dbf);
  if (!dbf && gjson) {
    return gjson;
  }
  if (!gjson) {
    return null;
  }
  // go through looking for features
  let featureNo = 0;
  function visit(gjson: GeoJSON.GeoJSON) {
    switch (gjson.type) {
      case 'Feature': {
        gjson.properties = dbf?.rows[featureNo];
        featureNo++;
        break;
      }
      case 'FeatureCollection': {
        for (let f of gjson.features) {
          visit(f);
        }
        break;
      }

      default:
        break;
    }
  }
  visit(gjson);
  return gjson;
}

export default function () {
  const editorContext = useContext(EditorContext);
  // const [inputError, setInputError] = useState<string>('');
  const fileUpload = useRef<HTMLInputElement | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuProps | null>(null);
  const menus = {
    File: {
      Import: {
        'Import File From Local Desktop': () => {
          fileUpload.current?.click();
        },
        'Import User Owned Maps': () => {
          setOpenRecentMapModal(true);
        },
      },
      Export: {
        'Export As PNG': () => {},
        'Export As SVG': () => {},
        'Export As JSON': () => {},
      },
      Publish: () => {
        setOpenPublishMapModal(true);
      },
    },
    View: {
      'Map Label Multi Select': () => {
        setOpenMapLabelModal(true);
      },
      'Choropleth Label Select': () => {
        setOpenChoropleth(true);
      },
    },
    Map: {},
  };

  const handleFiles = (fileList: FileList): string => {
    // New File List
    const files: File[] = [];
    if (fileList) {
      // Iterate and insert into a new file list.
      for (let i = 0; i < fileList.length; i += 1) {
        files.push(fileList[i]);
      }

      // Sort by file extension.
      files.sort((a, b) => {
        const aFileExt: string | undefined = a.name.split('.').pop();
        const bFileExt: string | undefined = b.name.split('.').pop();
        if (aFileExt && bFileExt) {
          // Sort both file extensions alphabetically.
          if (aFileExt < bFileExt) {
            return -1;
          } else if (aFileExt > bFileExt) {
            return 1;
          }
        } else if (aFileExt && !bFileExt) {
          // Move file without no extension to the back.
          return -1;
        } else if (!aFileExt && bFileExt) {
          // Move file without no extension to the back.
          return 1;
        } else {
          // Sort file names alphabetically.
          if (a.name < b.name) {
            return -1;
          } else if (a.name > b.name) {
            return 1;
          }
        }
        return 0;
      });
    }

    // Handle loading files.
    // TODO: Handle more file extensions listed in the accept string.
    // TODO: Verify files more rigorously (not through file extension).
    // TODO: Verify file combinations.
    if (
      (files.length === 1 && files[0].name.split('.').pop() === 'json') ||
      files[0].name.split('.').pop() === 'geojson'
    ) {
      // Handle shape file conversion to GeoJSON.
      const reader = new FileReader();
      reader.onload = e => {
        const content = e.target?.result as string;
        const geojsonData = JSON.parse(content);
        editorContext.dispatch({
          type: EditorActions.SET_MAP,
          payload: {
            map: buildMHJSON(geojsonData),
          },
        });
      };
      reader.readAsText(files[0]);
    } else if (files.length === 1 && files[0].name.split('.').pop() === 'kml') {
      // Handle KML conversion to GeoJSON.
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          const parser = new DOMParser();
          const kml = parser.parseFromString(
            e.target.result as string,
            'text/xml',
          );
          const converted = tj.kml(kml);
          editorContext.dispatch({
            type: EditorActions.SET_MAP,
            payload: {
              map: buildMHJSON(converted),
            },
          });
        }
      };
      reader.readAsText(files[0]);
    } else if (
      (files.length === 2 &&
        files[0].name.split('.').pop() === 'dbf' &&
        files[1].name.split('.').pop() === 'shp') ||
      (files.length === 3 &&
        files[0].name.split('.').pop() === 'dbf' &&
        files[1].name.split('.').pop() === 'shp' &&
        files[2].name.split('.').pop() === 'shx')
    ) {
      let gjson: GeoJSON.GeoJSON | null = null;
      let dtable: DataTable | null = null;
      // Handle shape file conversion to GeoJSON.
      const shpReader = new FileReader();
      shpReader.onload = async e => {
        if (e.target?.result) {
          const arrayBuffer = e.target.result as ArrayBuffer;
          gjson = await shp.read(arrayBuffer);
          let result = mergeData(gjson, dtable);
          if (result) {
            editorContext.dispatch({
              type: EditorActions.SET_MAP,
              payload: {
                map: buildMHJSON(result),
              },
            });
          }
        }
      };
      shpReader.readAsArrayBuffer(files[1]);

      // Handle DBF conversion to GeoJSON
      const dbfReader = new FileReader();
      dbfReader.onload = () => {
        var arrayBuffer: ArrayBuffer = dbfReader.result as ArrayBuffer;
        if (arrayBuffer) {
          let buffer: Buffer = Buffer.from(arrayBuffer);
          dtable = Dbf.read(buffer);
          let result = mergeData(gjson, dtable);
          if (result) {
            editorContext.dispatch({
              type: EditorActions.SET_MAP,
              payload: {
                map: buildMHJSON(result),
              },
            });
          }
        }
      };
      dbfReader.readAsArrayBuffer(files[0]);
    } else if (
      files.reduce((acc, curr) => acc || /.(dbf|shp)$/.test(curr.name), false)
    ) {
      return 'To load a shape file map, upload 1 .shp, and 1 .dbf file.';
    } else {
      return 'To load a map, upload 1 combination of .shp and .dbf file, 1 .json file, or 1 .kml file.';
    }
    return '';
  };
  function handleMenuClose() {
    setOpenMenu(null);
  }

  //--------- Modal States ---------
  const [openImport, setOpenImport] = useState(false);
  const [openChoropleth, setOpenChoropleth] = useState(false);
  const [openMapLabelModal, setOpenMapLabelModal] = useState(false);
  const [openRecentMapModal, setOpenRecentMapModal] = useState(false);
  const [openPublishMapModal, setOpenPublishMapModal] = useState(false);
  const selectedOptions = [
    'Country Name',
    'Languages',
    'Population',
    'chinese',
    '조선글',
    'arabic',
    'Christians',
  ];

  function onImportConfirm(mapName: string, optionsProps: string[]) {
    console.log(mapName, optionsProps);

    setOpenImport(false);
  }

  function onChoroplethConfirm(optionsProps: string[]) {
    setOpenChoropleth(false);
  }
  function onMultiMapConfirm(optionsProps: string[]) {
    setOpenMapLabelModal(false);
  }
  function onRecentMapConfirm(mapId: string) {
    setOpenRecentMapModal(false);
  }

  function onPublishMapConfirm() {
    alert('Published!');
  }

  return (
    <div className={styles['ribbon-container']}>
      <div className={styles['dropdowns']}>
        <Button
          variant="text"
          onClick={e => {
            setOpenMenu({
              items: menus.File,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          File
        </Button>
        <Button
          variant="text"
          onClick={e => {
            setOpenMenu({
              items: menus.View,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          View
        </Button>
        <Button
          variant="text"
          onClick={e => {
            setOpenMenu({
              items: menus.Map,
              anchorEl: e.currentTarget,
              onClose: handleMenuClose,
              isTopLevel: true,
            });
          }}
        >
          Map
        </Button>
      </div>
      <div className={styles['map-title']}>
        <Typography variant="title">Anglicans Down Under</Typography>
      </div>
      <div className={styles['undo-redo']}>
        <Undo fontSize="medium" />
        <Redo fontSize="medium" />
      </div>
      {openMenu ? <EditorMenu {...openMenu} /> : <></>}
      <ImportModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        onConfirm={onImportConfirm}
      />
      <ChoroplethModal
        open={openChoropleth}
        onClose={() => setOpenChoropleth(false)}
        onConfirm={onChoroplethConfirm}
        properties={selectedOptions}
      />
      <MultiMapLabelModal
        open={openMapLabelModal}
        onClose={() => setOpenMapLabelModal(false)}
        onConfirm={onMultiMapConfirm}
        properties={selectedOptions}
      />
      <RecentMapModal
        open={openRecentMapModal}
        onClose={() => setOpenRecentMapModal(false)}
        onConfirm={onRecentMapConfirm}
      />
      <PublishMapModal
        open={openPublishMapModal}
        onClose={() => setOpenPublishMapModal(false)}
        onConfirm={onPublishMapConfirm}
      />
      <input
        type="file"
        multiple
        accept={accept}
        onChange={ev => {
          let targ = ev.target as HTMLInputElement;
          if (targ.files && targ.files.length) {
            let err = handleFiles(targ.files);
            if (err) {
              // TODO: make a modal out of this
              alert(err);
            } else {
              setOpenImport(true);
            }
          }
        }}
        id="import-file-upload-button"
        ref={fileUpload}
        style={{
          visibility: 'hidden',
          position: 'absolute',
          marginTop: '-100px',
          marginLeft: '-100px',
        }}
      />
    </div>
  );
}
