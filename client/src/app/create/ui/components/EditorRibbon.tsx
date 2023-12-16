'use client';
import { TextField, Typography } from '@mui/material';
import { Undo, Redo } from '@mui/icons-material';
import styles from './EditorRibbon.module.scss';
import { useContext, useEffect, useRef, useState } from 'react';
import EditorMenu, { MenuProps } from './EditorMenu';
import ImportModal from './modals/importModal';
import ChoroplethModal from './modals/choroplethModal';
import MultiMapLabelModal from './modals/multiLabelModal';
import RecentMapModal from './modals/recentMapModal';
import PublishMapModal from './modals/publishModal';
import Button from 'components/button';
import {
  EditorActions,
  EditorContext,
  GUEST_MAP_ID,
} from 'context/EditorProvider';
import { buildMHJSON } from 'app/create/MHJsonBuilder';
import * as G from 'geojson';
import { handleFiles } from './helpers/ImportHelpers';
import { MHJSON, MapType } from 'types/MHJSON';
import { GeoJSONVisitor } from 'context/editorHelpers/GeoJSONVisitor';
import exportMap from './helpers/ExportHelpers';
import {
  createNewMap,
  loadMapById,
  updateMapById,
} from './helpers/EditorAPICalls';
import { AuthContext } from 'context/AuthProvider';
import IconButton from 'components/iconButton';
import { useRouter, useSearchParams } from 'next/navigation';
import { readFile } from 'fs';
import { MapPayload } from 'types/mapPayload';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';
import { DeltaType, TargetType } from 'types/delta';

// A list of all accepted file types.
const accept: string =
  '.shp, .shx, .dbf, ' + // Shape Files
  '.json, .geojson, application/geo+json, ' + // GeoJSON Files
  '.kml, .kmz, application/vnd.google-earth.kml+xml, ' + // Keyhole Files
  'application/vnd.google-earth.kmz';

export default function () {
  const editorContext = useContext(EditorContext);
  const authContext = useContext(AuthContext);
  // const [inputError, setInputError] = useState<string>('');
  const fileUpload = useRef<HTMLInputElement | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuProps | null>(null);
  const [userGeoJSON, setUserGeoJSON] = useState<G.GeoJSON>({
    type: 'Point',
    coordinates: [0, 0],
  });
  const [visitor, setVisitor] = useState<GeoJSONVisitor>(
    new GeoJSONVisitor({
      type: 'Point',
      coordinates: [0, 0],
    }),
  );
  const menus = {
    File: {
      Import: {
        'Import File From Local Desktop': {
          onclick: () => {
            fileUpload.current?.click();
          },
        },
        'Import User Owned Maps': {
          onclick: () => {
            setOpenRecentMapModal(true);
          },
          disabled: !authContext.state.isLoggedIn,
        },
      },
      Export: {
        'Export As PNG': {
          onclick: () => {
            exportMap(editorContext.state.map, 'png');
          },
          disabled: editorContext.state.map === null,
        },
        'Export As SVG': {
          onclick: () => {
            exportMap(editorContext.state.map, 'svg');
          },
          disabled: editorContext.state.map === null,
        },
        'Export As JSON': {
          onclick: () => {
            exportMap(editorContext.state.map, 'json');
          },
          disabled: editorContext.state.map === null,
        },
      },
      Publish: {
        onclick: () => {
          setOpenPublishMapModal(true);
        },
        disabled:
          !authContext.state.isLoggedIn || editorContext.state.map === null,
      },
    },
    View: {
      'Map Label Multi Select': {
        onclick: () => {
          setOpenMapLabelModal(true);
        },
      },
      'Choropleth Label Select': {
        onclick: () => {
          setOpenChoropleth(true);
        },
      },
    },
    Map: {},
  };

  function handleMenuClose() {
    setOpenMenu(null);
  }

  const handleEditMapTitle = () => {
    setEditingTitle(true);
    setUpdatedTitle(editorContext.state.map?.title || '');
  };

  const handleBlur = async () => {
    // Update the map title and close editing mode
    const payload: MapPayload = {
      mapId: editorContext.state.map_id,
      title: updatedTitle,
    };
    console.log(payload);
    await updateMapById(payload).then(success => {
      if (success) {
        editorContext.helpers.changeTitle(editorContext, updatedTitle);
        setEditingTitle(false);
      }
    });
  };

  //--------- Modal States ---------
  const [openImport, setOpenImport] = useState(false);
  const [openChoropleth, setOpenChoropleth] = useState(false);
  const [openMapLabelModal, setOpenMapLabelModal] = useState(false);
  const [openRecentMapModal, setOpenRecentMapModal] = useState(false);
  const [openPublishMapModal, setOpenPublishMapModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const selectedOptions = [
    'Country Name',
    'Languages',
    'Population',
    'chinese',
    '조선글',
    'arabic',
    'Christians',
  ];

  const router = useRouter();
  const searchParams = useSearchParams();

  function onImportConfirm(
    mapName: string,
    mapType: MapType,
    optionsProps: string[],
  ) {
    if(mapType == MapType.NONE) {
      throw new Error('Please select a map type.');
    }
    let mh: MHJSON = buildMHJSON(userGeoJSON);
    mh.title = mapName;
    mh.labels = optionsProps;
    mh.mapType = mapType;
    let v = new GeoJSONVisitor(mh.geoJSON, true);
    v.visitRoot();
    setVisitor(v);
    mh.regionsData = v.getFeatureResults().perFeature.map(_ => {
      return {};
    });
    let createMapProm: Promise<string>;
    if (authContext.state.isLoggedIn) {
      mh.owner = authContext.state.user?.id ? authContext.state.user?.id : '';
      createMapProm = createNewMap(mh);
    } else {
      createMapProm = Promise.resolve(GUEST_MAP_ID);
    }
    createMapProm.then(id => {
      // router.push('?mapid=' + id);
      console.log(mh);
      editorContext.helpers.setLoadedMap(editorContext, id, mh);
      setOpenImport(false);
    });
  }

  function onChoroplethConfirm(optionsProps: string[]) {
    let keyName = DELETED_NAME;
    let oldName =
      editorContext.state.map?.globalChoroplethData.indexingKey ?? DELETED_NAME;
    if (optionsProps.length !== 0) {
      keyName = optionsProps[0];
    }
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.GLOBAL_CHOROPLETH,
        target: [editorContext.state.map_id, 0, '-1'],
        payload: {
          indexingKey: keyName,
        },
      },
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.GLOBAL_CHOROPLETH,
        target: [editorContext.state.map_id, 0, '-1'],
        payload: {
          indexingKey: oldName,
        },
      },
    );
    setOpenChoropleth(false);
  }
  function onMultiMapConfirm(optionsProps: string[]) {
    setOpenMapLabelModal(false);
  }

  useEffect(() => {
    console.log("map loading!");
    const mapId = searchParams.get('mapid') as string;
    console.log(mapId);
    if (mapId && editorContext.state.map_id !== mapId) {
      let getMap: Promise<MHJSON>;
      if (authContext.state.isLoggedIn) {
        getMap = loadMapById(mapId);
        getMap.then(map => {
          let geoJSON = map.geoJSON.toString();
          console.log(geoJSON);
          let parsedGeoJSON = JSON.parse(geoJSON);
          console.log(parsedGeoJSON);
          console.log(typeof parsedGeoJSON);
          map.geoJSON = parsedGeoJSON;
          editorContext.helpers.setLoadedMap(editorContext, mapId, map);
          console.log('loaded map set');
          // setUserGeoJSON(typeof geoJSON === 'string' ? JSON.parse(geoJSON) : geoJSON);
          setOpenImport(false);
        });
      }
    }
  }, [searchParams]);

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
      <div className={styles['map-title']} onDoubleClick={handleEditMapTitle}>
        {editingTitle ? (
          <TextField
            id="outlined-basic"
            variant="outlined"
            value={updatedTitle}
            onChange={e => setUpdatedTitle(e.target.value)}
            onBlur={handleBlur}
            size="small"
          />
        ) : (
          <Typography variant="title">
            {editorContext.state.map?.title ?? ''}
          </Typography>
        )}
      </div>
      <div className={styles['undo-redo']}>
        <IconButton
          iconName={'Undo'}
          disabled={!editorContext.state.actionStack.canUndo()}
          onClick={() => {
            if (editorContext.state.actionStack.canUndo()) {
              editorContext.helpers.undo(editorContext);
            }
          }}
          disabled={editorContext.state.actionStack.stack.length == 0}
        >
          <Undo fontSize="medium" />
        </IconButton>
        <IconButton
          iconName={'Redo'}
          disabled={!editorContext.state.actionStack.canRedo()}
          onClick={() => {
            if (editorContext.state.actionStack.canRedo()) {
              editorContext.helpers.redo(editorContext);
            }
          }}
          disabled={editorContext.state.actionStack.counterStack.length == 0}
        >
          <Redo fontSize="medium" />
        </IconButton>
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
        properties={Array.from(
          visitor.getFeatureResults().aggregate.numericKeys,
        )}
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
      />
      <PublishMapModal
        open={openPublishMapModal}
        onClose={() => setOpenPublishMapModal(false)}
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
          visibility: 'hidden',
          position: 'absolute',
          marginTop: '-100px',
          marginLeft: '-100px',
        }}
      />
    </div>
  );
}
