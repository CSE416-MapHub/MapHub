'use client';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
  IEditorState,
} from 'context/EditorProvider';
import * as G from 'geojson';
import * as L from 'leaflet';
import { useContext, useState, useEffect, useRef } from 'react';
import { GeoJSON, TileLayer, useMap } from 'react-leaflet';
import { IInputProps } from './PropertyInput';

import { Dispatch } from 'react';

const OPEN_BOUNDS = L.latLngBounds(L.latLng(-900, 1800), L.latLng(900, -1800));

const MIN_ZOOM = 0;
const MAX_ZOOM = 20;

export default function () {
  const editorContextStaleable = useContext<{
    state: IEditorState;
    dispatch: Dispatch<{
      type: EditorActions;
      payload: Partial<IEditorState>;
    }>;
  }>(EditorContext);
  const map = useMap();
  const [eBBox, setEBBox] = useState<[number, number]>([0, 0]);
  const [rerender, setRerender] = useState(0);
  const editorContextRef = useRef<{
    state: IEditorState;
    dispatch: Dispatch<{
      type: EditorActions;
      payload: Partial<IEditorState>;
    }>;
  }>(editorContextStaleable);

  editorContextRef.current = editorContextStaleable;

  useEffect(() => {
    let b = editorContextStaleable.state.mapDetails.bbox;
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

  function perFeatureHandler(feature: G.Feature, layer: L.Layer) {
    layer.addEventListener('click', () => {
      console.log('clicked a feature');
      if (
        editorContextRef.current.state.selectedTool !== ToolbarButtons.select
      ) {
        console.log(
          'but the current tool isnt select; it is ' +
            editorContextRef.current.state.selectedTool,
        );
        return;
      }
      let action = {
        type: EditorActions.SET_PANEL,
        payload: {
          propertiesPanel: [
            {
              name: 'Labels',
              // TODO: force unundefined
              items: editorContextRef.current.state.map!.labels.map(
                (
                  lbl,
                ): {
                  name: string;
                  input: IInputProps;
                } => {
                  return {
                    name: lbl,
                    input: {
                      type: 'text',
                      short: false,
                      disabled: false,
                      value: feature.properties
                        ? feature.properties[lbl].toString()
                        : 'undefined',
                    },
                  };
                },
              ),
            },
          ],
        },
      };
      editorContextRef.current.dispatch(action);
    });
    let p = layer as L.Path;
    p.setStyle({
      color: '#000000',
      fillColor: 'white',
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
    <GeoJSON
      key={rerender}
      data={editorContextStaleable.state.map?.geoJSON}
      onEachFeature={perFeatureHandler}
    />
  );
}
