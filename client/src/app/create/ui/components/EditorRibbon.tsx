'use client';

import { Typography } from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import styles from './EditorRibbon.module.scss';
import { useContext, useRef, useState } from 'react';
import EditorMenu, { MenuProps } from './EditorMenu';
import ImportModal from './modals/importModal';
import ChoroplethModal from './modals/choroplethModal';
import MultiMapLabelModal from './modals/multiLabelModal';
import RecentMapModal from './modals/recentMapModal';
import PublishMapModal from './modals/publishModal';
import Button from 'components/button';
import { EditorActions, EditorContext } from 'context/EditorProvider';
import { buildMHJSON } from 'app/create/MHJsonBuilder';
import * as G from 'geojson';
import { handleFiles } from './helpers/ImportHelpers';
import { MHJSON } from 'types/MHJSON';
import { GeoJSONVisitor } from 'context/editorHelpers/GeoJSONVisitor';
import exportMap from './helpers/ExportHelpers';

// A list of all accepted file types.
const accept: string =
  '.shp, .shx, .dbf, ' + // Shape Files
  '.json, .geojson, application/geo+json, ' + // GeoJSON Files
  '.kml, .kmz, application/vnd.google-earth.kml+xml, ' + // Keyhole Files
  'application/vnd.google-earth.kmz';

export default function () {
  const editorContext = useContext(EditorContext);
  // const [inputError, setInputError] = useState<string>('');
  const fileUpload = useRef<HTMLInputElement | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuProps | null>(null);
  const [userGeoJSON, setUserGeoJSON] = useState<G.GeoJSON>({
    type: 'Point',
    coordinates: [0, 0],
  });
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
        'Export As PNG': () => {
          exportMap(editorContext.state.map, 'png');
        },
        'Export As SVG': () => {
          exportMap(editorContext.state.map, 'svg');
        },
        'Export As JSON': () => {
          exportMap(editorContext.state.map, 'json');
        },
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
    let mh: MHJSON = buildMHJSON(userGeoJSON);
    mh.title = mapName;
    mh.labels = optionsProps;
    editorContext.dispatch({
      type: EditorActions.SET_MAP,
      payload: {
        map: mh,
      },
    });
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
        <Typography variant="title">
          {editorContext.state.map?.title ?? 'My Map'}
        </Typography>
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
        properties={((): string[] => {
          let visitor = new GeoJSONVisitor(userGeoJSON);
          visitor.visitRoot();
          return Array.from(
            visitor.getFeatureResults().aggregate.globallyAvailableKeys,
          );
        })()}
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
            handleFiles(targ.files)
              .then(v => {
                setUserGeoJSON(v);
                setOpenImport(true);
              })
              .catch(e => {
                alert(e);
              });
          }
        }}
        id="import-file-upload-button"
        ref={fileUpload}
        style={{
          // visibility: 'hidden',
          position: 'absolute',
          marginTop: '-100px',
          marginLeft: '-100px',
        }}
      />
    </div>
  );
}
