import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { Circle, CircleMarker } from 'react-leaflet';
import { useContext, useRef, useState } from 'react';
import { IDotDensityProps, IDotInstance, MHJSON } from 'types/MHJSON';
import { DeltaType, TargetType } from 'types/delta';
import L from 'leaflet';

interface DotProps {
  dotInstance: IDotInstance;
  dotClass: IDotDensityProps;
  id: number;
  mapClickHandler: (ev: L.LeafletMouseEvent) => void;
}

export default function ({
  dotInstance,
  dotClass,
  id,
  mapClickHandler,
}: DotProps) {
  let editorContextRef = useContext(EditorContext);

  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(dotInstance.x);
  const [y, setY] = useState(dotInstance.y);
  const [rerender, setRerender] = useState(0);
  function handleClick(ev: L.LeafletMouseEvent) {
    if (editorContextRef.state.selectedTool === ToolbarButtons.select) {
      let loadedMap: MHJSON;
      if (editorContextRef.state.map) {
        loadedMap = editorContextRef.state.map;
      } else {
        return;
      }
      editorContextRef.dispatch({
        type: EditorActions.SET_SELECTED,
        payload: {
          selectedItem: {
            type: TargetType.DOT,
            id: id,
            subid: '-1',
          },
        },
      });
      return;
    }
    mapClickHandler(ev);
  }

  function handleMouseUp(ev: L.LeafletMouseEvent) {
    if (dragging) {
      setDragging(false);
      editorContextRef.helpers.addDelta(
        editorContextRef,
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.DOT,
          target: [editorContextRef.state.map_id, id, '-1'],
          payload: {
            x,
            y,
          },
        },
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.DOT,
          target: [editorContextRef.state.map_id, id, '-1'],
          payload: {
            x: dotInstance.x,
            y: dotInstance.y,
          },
        },
      );
    }
  }

  function deleteSelf() {
    editorContextRef.helpers.addDelta(
      editorContextRef,
      {
        type: DeltaType.DELETE,
        targetType: TargetType.DOT,
        target: [editorContextRef.state.map_id, id, '-1'],
        payload: {},
      },
      {
        type: DeltaType.CREATE,
        targetType: TargetType.DOT,
        target: [editorContextRef.state.map_id, id, '-1'],
        payload: structuredClone(dotInstance),
      },
    );
  }

  function handleMouseDown(ev: L.LeafletMouseEvent) {
    const thisIsSelected =
      editorContextRef.state.selectedItem &&
      editorContextRef.state.selectedItem.id === id &&
      editorContextRef.state.selectedItem.type == TargetType.DOT &&
      editorContextRef.state.selectedTool === ToolbarButtons.select;
    if (thisIsSelected) {
      setDragging(true);
    }
    if (editorContextRef.state.selectedTool === ToolbarButtons.erase) {
      deleteSelf();
    }
  }

  function handleMouseMove(ev: L.LeafletMouseEvent) {
    console.log('MOUSE IS OVER');
    if (dragging) {
      console.log('moving dot to ', ev.latlng);
      setX(ev.latlng.lng);
      setY(ev.latlng.lat);
      setRerender(rerender + 1);
    }
    if (!dragging && editorContextRef.state.isDeleting) {
      deleteSelf();
    }
  }
  let mapbox = editorContextRef.state.mapDetails.bbox;
  let DEFAULT_SZ = Math.min(mapbox[2], mapbox[3]) * 2000;
  // console.log('size is ' + DEFAULT_SZ * dotClass.size * dotInstance.scale);
  return (
    <Circle
      center={L.latLng(y, x)}
      key={rerender}
      color="#000000"
      weight={0}
      fillOpacity={dotClass.opacity}
      fillColor={dotClass.color}
      radius={DEFAULT_SZ * dotClass.size * dotInstance.scale}
      className="map-dot"
      eventHandlers={{
        click: ev => {
          handleClick(ev);
          L.DomEvent.stopPropagation(ev);
        },
        mousedown: ev => {
          handleMouseDown(ev);
          L.DomEvent.stopPropagation(ev);
        },
        mouseup: ev => {
          handleMouseUp(ev);
          L.DomEvent.stopPropagation(ev);
        },
        mousemove: ev => {
          handleMouseMove(ev);
          L.DomEvent.stopPropagation(ev);
        },
      }}
    />
  );
}
