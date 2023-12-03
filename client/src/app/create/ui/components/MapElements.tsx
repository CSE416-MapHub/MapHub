'use client';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import * as G from 'geojson';
import * as L from 'leaflet';
import { useContext, useState, useEffect, useRef } from 'react';
import { CircleMarker, GeoJSON, useMap } from 'react-leaflet';

import { DeltaType, TargetType } from 'types/delta';
import { IDotDensityProps, IRegionProperties, MHJSON } from 'types/MHJSON';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';
import Dot from './instances/Dot';

const OPEN_BOUNDS = L.latLngBounds(L.latLng(-900, 1800), L.latLng(900, -1800));

const MIN_ZOOM = 0;
const MAX_ZOOM = 20;

export default function () {
  const editorContextStaleable = useContext(EditorContext);
  const map = useMap();
  const [eBBox, setEBBox] = useState<[number, number]>([0, 0]);
  const [rerender, setRerender] = useState(0);
  const [currentRegionProps, setCurrentRegionProps] = useState<
    Array<IRegionProperties>
  >([]);
  const editorContextRef = useRef(editorContextStaleable);

  const [dotNames, setDotNames] = useState<Map<string, IDotDensityProps>>(
    new Map(),
  );
  const [draggingItem, setDraggingItem] = useState(null);
  editorContextRef.current = editorContextStaleable;


  useEffect(() => {
    let b = editorContextStaleable.state.mapDetails.bbox;
    let loadedMap = editorContextRef.current.state.map;
    if (loadedMap && dotNames.size !== loadedMap.globalDotDensityData.length) {
      let nameMap = new Map<string, IDotDensityProps>();
      for (let ip of loadedMap.globalDotDensityData) {
        nameMap.set(ip.name, ip);
      }
      setDotNames(nameMap);
    }

    if (b[1] !== eBBox[0] || b[0] !== eBBox[1]) {
      let c: [number, number] = [b[1], b[0]];
      setEBBox(c);
      setRerender(rerender + 1);
      map.setMaxZoom(MAX_ZOOM);
      map.setMinZoom(MIN_ZOOM);
      map.setView([c[0] + b[3] / 2, c[1] + b[2] / 2], 10 - Math.log2(b[2]));
      map.setMaxZoom(map.getZoom());
      map.setMinZoom(map.getZoom());
    }

    // if the tool selected is pan, allow for panning
    if (editorContextStaleable.state.selectedTool !== ToolbarButtons.pan) {
      map.setMaxBounds(map.getBounds());
      map.setMaxZoom(map.getZoom());
      map.setMinZoom(map.getZoom());
    } else {
      map.setMaxBounds(OPEN_BOUNDS);
      map.setMaxZoom(MAX_ZOOM);
      map.setMinZoom(MIN_ZOOM);
    }

    // if theres a map, make sure the loaded regions and the displayed regions
    // are synced
    if (loadedMap && loadedMap.regionsData !== currentRegionProps) {
      setCurrentRegionProps(loadedMap.regionsData);
      // setRerender(rerender + 1);
    }
  });

  // handles clicks, regardless of whether or not theyre on a
  // this is for tools that create items, like dot, symbol, arrow
  function handleMapClick(ev: L.LeafletMouseEvent) {
    let latlng = ev.latlng;
    let map = editorContextRef.current.state.map;
    if (map === null) return;
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.dot) {
      let dotData = editorContextRef.current.helpers.getLastInstantiatedDot(
        editorContextRef.current,
      );
      if (dotData === null) {
        throw new Error('Youve never made a dot before');
      }
      let targetID = map.dotsData.length;
      editorContextRef.current.helpers.addDelta(
        editorContextRef.current,
        {
          type: DeltaType.CREATE,
          targetType: TargetType.DOT,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {
            y: latlng.lat,
            x: latlng.lng,
            scale: 1,
            dot: dotData.name,
          },
        },
        {
          type: DeltaType.DELETE,
          targetType: TargetType.DOT,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {},
        },
      );
    }
  }

  map.addEventListener('click', ev => {
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.select) {
      let action = {
        type: EditorActions.SET_SELECTED,
        payload: {
          selectedItem: null,
        },
      };
      editorContextRef.current.dispatch(action);
      return;
    }
    handleMapClick(ev);
  });

  map.addEventListener('mousedown', ev => {
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.erase) {
      editorContextRef.current.dispatch({
        type: EditorActions.SET_DELETING,
        payload: {
          isDeleting: true,
        },
      });
    }
  });

  map.addEventListener('mouseup', ev => {
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.erase) {
      editorContextRef.current.dispatch({
        type: EditorActions.SET_DELETING,
        payload: {
          isDeleting: false,
        },
      });
    }
  });

  let i = 0;

  function perFeatureHandler(feature: G.Feature, layer: L.Layer) {
    let myId = i;
    i += 1;
    layer.addEventListener('click', ev => {
      if (
        editorContextRef.current.state.selectedTool !== ToolbarButtons.select
      ) {
        L.DomEvent.stopPropagation(ev);
        handleMapClick(ev);
        return;
      }
      editorContextRef.current.dispatch({
        type: EditorActions.SET_SELECTED,
        payload: {
          selectedItem: {
            type: TargetType.REGION,
            id: myId,
            subid: '-1',
          },
        },
      });
      L.DomEvent.stopPropagation(ev);
    });
    let p = layer as L.Path;
    p.setStyle({
      color: '#000000',
      fillColor: currentRegionProps[myId]?.color ?? 'white',
      fillOpacity: 1,
      opacity: 1,
      stroke: true,
      weight: 1,
    });
  }

  if (editorContextStaleable.state.map === null) {
    return <div></div>;
  }

  return (
    <>
      <GeoJSON
        key={rerender}
        data={editorContextStaleable.state.map?.geoJSON}
        onEachFeature={perFeatureHandler}
      />
      {editorContextRef.current.state.map?.dotsData.map((dotInstance, i) => {
        if (dotInstance.dot === DELETED_NAME) {
          return;
        }
        let dotClass = dotNames.get(dotInstance.dot) ?? {
          opacity: 0,
          name: DELETED_NAME,
          color: '#000000',
          size: 0,
        };
        return (
          <Dot
            dotInstance={dotInstance}
            dotClass={dotClass}
            id={i}
            mapClickHandler={handleMapClick}
            key={`${i}_${dotInstance.dot}_${dotInstance.x}_${dotInstance.y}_${dotInstance.scale}_${dotClass.opacity}_${dotClass.name}_${dotClass.color}_${dotClass.opacity}`}
          />
        );
      })}
    </>
  );
}
