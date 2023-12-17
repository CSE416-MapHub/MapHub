'use client';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import * as G from 'geojson';
import * as L from 'leaflet';
import { useContext, useState, useEffect, useRef } from 'react';
import { CircleMarker, GeoJSON, Pane, SVGOverlay, useMap } from 'react-leaflet';

import { DeltaType, TargetType } from 'types/delta';
import {
  IDotDensityProps,
  IRegionProperties,
  ISymbolProps,
  MHJSON,
} from 'types/MHJSON';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';
import Dot from './instances/Dot';
import Text from './instances/Text';
import Symbol from './instances/Symbol';
import { getInterpolationPoints } from './helpers/ArrowFixer';
import Arrow from './instances/Arrow';
import { mixColors } from './helpers/MHJSONVisitor';

const OPEN_BOUNDS = L.latLngBounds(L.latLng(-900, 1800), L.latLng(900, -1800));

const MIN_ZOOM = 0;
const MAX_ZOOM = 20;

const dummySVG = `<?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 13.6493C3 16.6044 5.41766 19 8.4 19L16.5 19C18.9853 19 21 16.9839 21 14.4969C21 12.6503 19.8893 10.9449 18.3 10.25C18.1317 7.32251 15.684 5 12.6893 5C10.3514 5 8.34694 6.48637 7.5 8.5C4.8 8.9375 3 11.2001 3 13.6493Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

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
  const [symbolNames, setSymbolNames] = useState<Map<string, ISymbolProps>>(
    new Map(),
  );
  const [choroplethKey, setChoroplethKey] = useState<string>(DELETED_NAME);
  const stkLen = useRef(0);
  editorContextRef.current = editorContextStaleable;

  useEffect(() => {
    let b = editorContextStaleable.state.mapDetails.bbox;
    let loadedMap = editorContextRef.current.state.map;
    if (loadedMap && loadedMap.regionsData !== currentRegionProps) {
      setCurrentRegionProps(loadedMap.regionsData);
      setRerender(rerender + 1);
    }
    if (loadedMap) {
      if (dotNames.size !== loadedMap.globalDotDensityData.length) {
        let nameMap = new Map<string, IDotDensityProps>();
        for (let ip of loadedMap.globalDotDensityData) {
          nameMap.set(ip.name, ip);
        }
        setDotNames(nameMap);
      }
      if (symbolNames.size !== loadedMap.globalSymbolData.length) {
        let nameMap = new Map<string, ISymbolProps>();
        for (let ip of loadedMap.globalSymbolData) {
          nameMap.set(ip.name, ip);
        }
        setSymbolNames(nameMap);
      }
      if (loadedMap.globalChoroplethData.indexingKey !== choroplethKey) {
        setChoroplethKey(loadedMap.globalChoroplethData.indexingKey);
        setRerender(rerender + 1);
      }
      // if the top of either stack is a geojson delta, we will
      // rerneder the map
      let d1 = editorContextRef.current.state.actionStack.peekStack();
      let d2 = editorContextRef.current.state.actionStack.peekCounterstack();
      if (
        stkLen.current !==
          editorContextRef.current.state.actionStack.stack.length &&
        ((d1 &&
          d1.do.targetType === TargetType.GEOJSONDATA &&
          d1.do.type == DeltaType.UPDATE) ||
          (d2 && d2.undo.targetType === TargetType.GEOJSONDATA))
      ) {
        setRerender(rerender + 1);
      }
    }

    // if theres a map, make sure the loaded regions and the displayed regions
    // are synced and no dot names

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
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.symbol) {
      let symData = editorContextRef.current.helpers.getLastInstantiatedSymbol(
        editorContextRef.current,
      );
      if (symData === null) {
        throw new Error('Youve never made a symbol before');
      }
      let targetID = map.symbolsData.length;
      editorContextRef.current.helpers.addDelta(
        editorContextRef.current,
        {
          type: DeltaType.CREATE,
          targetType: TargetType.SYMBOL,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {
            y: latlng.lat,
            x: latlng.lng,
            scale: 1,
            symbol: symData.name,
          },
        },
        {
          type: DeltaType.DELETE,
          targetType: TargetType.SYMBOL,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {},
        },
      );
    }
  }

  map.removeEventListener('click');
  map.removeEventListener('mousedown');
  map.removeEventListener('mouseup');

  map.addEventListener('click', ev => {
    console.log('logged a map click');
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

  let arrowBuffer: Array<{ x: number; y: number }> = [];
  let buildingArrow = false;

  map.addEventListener('mousedown', ev => {
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.erase) {
      editorContextRef.current.dispatch({
        type: EditorActions.SET_DELETING,
        payload: {
          isDeleting: true,
        },
      });
    }
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.arrow) {
      console.log('BEGIN BUILD');
      arrowBuffer = [];
      buildingArrow = true;
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
    if (editorContextRef.current.state.selectedTool === ToolbarButtons.arrow) {
      buildingArrow = false;
      let targetID = editorContextRef.current.state.map?.arrowsData.length;
      if (targetID === undefined) {
        return;
      }
      console.log('EMD BUILD');
      editorContextRef.current.helpers.addDelta(
        editorContextRef.current,
        {
          type: DeltaType.CREATE,
          targetType: TargetType.ARROW,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {
            label: 'New Arrow',
            color: 'black',
            opacity: 1,
            capacity: 8,
            interpolationPoints: getInterpolationPoints(arrowBuffer),
          },
        },
        {
          type: DeltaType.DELETE,
          targetType: TargetType.ARROW,
          target: [editorContextRef.current.state.map_id, targetID, '-1'],
          payload: {},
        },
      );
    }
  });

  map.addEventListener('mousemove', ev => {
    if (buildingArrow) {
      arrowBuffer.push({
        x: ev.latlng.lng,
        y: ev.latlng.lat,
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
    let fillColor = 'white';
    if (currentRegionProps[myId]) {
      let c = currentRegionProps[myId].color;
      if (c) {
        fillColor = c;
      }
      c = currentRegionProps[myId].category;
      if (c !== undefined && c !== DELETED_NAME) {
        // find the category
        let categoryId = -1;
        editorContextRef.current.state.map?.globalCategoryData.forEach(
          (v, i) => {
            if (v.name === c) {
              categoryId = i;
            }
          },
        );
        if (categoryId === -1) {
          throw new Error('Failed to locate the category for name ' + c);
        }
        fillColor =
          editorContextRef.current.state.map!.globalCategoryData[categoryId]
            .color;
      }

      if (editorContextRef.current.state.map?.mapType === 'choropleth') {
        let intensity = currentRegionProps[myId].intensity ?? NaN;
        if (choroplethKey !== DELETED_NAME) {
          let p =
            editorContextRef.current.state.mapDetails.regionData[myId]
              .originalFeature.properties;
          if (p) {
            intensity = parseFloat(p[choroplethKey]);
          } else {
            intensity = NaN;
          }
        }
        let cData = editorContextRef.current.state.map!.globalChoroplethData;
        let ratio =
          (intensity - cData.minIntensity) /
          (cData.maxIntensity - cData.minIntensity);
        if (ratio < 0 || ratio > 1 || Number.isNaN(ratio)) {
          fillColor = 'white';
        } else {
          fillColor = mixColors(cData.minColor, cData.maxColor, ratio);
        }
      }
    }

    p.setStyle({
      color: '#000000',
      fillColor: fillColor,
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
      <Pane name={'map'} style={{ zIndex: 64 }}>
        <GeoJSON
          key={rerender}
          data={editorContextStaleable.state.map?.geoJSON}
          onEachFeature={perFeatureHandler}
        />
      </Pane>
      <Pane name={'map-elements'} style={{ zIndex: 92 }}>
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
        {editorContextRef.current.state.map?.symbolsData.map(
          (symbolInstance, i) => {
            if (symbolInstance.symbol === DELETED_NAME) {
              return;
            }
            let symbolClass = symbolNames.get(symbolInstance.symbol) ?? {
              name: DELETED_NAME,
              svg: dummySVG,
            };
            return (
              <Symbol
                symbolInstance={symbolInstance}
                symbolClass={symbolClass}
                id={i}
                mapClickHandler={handleMapClick}
                key={`${i}_${symbolInstance.symbol}_${symbolInstance.x}_${symbolInstance.y}_${symbolInstance.scale}_${symbolClass.name}`}
              />
            );
          },
        )}
        {editorContextRef.current.state.map?.arrowsData.map((arrow, i) => {
          if (arrow.label === DELETED_NAME) {
            return;
          }
          return (
            <Arrow
              arrow={arrow}
              id={i}
              key={`arrow_${i}_${JSON.stringify(arrow)}`}
            />
          );
        })}
        {(() => {
          let details = editorContextRef.current.state.mapDetails.regionData;
          let activeLabels = editorContextRef.current.state.map!.labels;
          return details.map((d, i) => {
            let label = activeLabels.map(l => {
              if (d.originalFeature.properties !== null) {
                return d.originalFeature.properties[l] ?? 'undefined';
              }
              return 'undefined';
            });

            return (
              <Text
                value={label}
                // box={[91.93, 31.8086, 30.67, 8.241]}
                box={d.box}
                key={`${i}${d.box}${label}`}
              ></Text>
            );
          });
        })()}
      </Pane>
    </>
  );
}
