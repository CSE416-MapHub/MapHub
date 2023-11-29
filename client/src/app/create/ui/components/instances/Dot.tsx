import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { CircleMarker } from 'react-leaflet';
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

  function handleMouseDown(ev: L.LeafletMouseEvent) {
    const thisIsSelected =
      editorContextRef.state.selectedItem &&
      editorContextRef.state.selectedItem.id === id &&
      editorContextRef.state.selectedItem.type == TargetType.DOT;
    if (thisIsSelected) {
      setDragging(true);
    }
  }

  function handleMouseMove(ev: L.LeafletMouseEvent) {
    if (dragging) {
      setX(ev.latlng.lng);
      setY(ev.latlng.lat);
    }
  }

  return (
    <CircleMarker
      center={L.latLng(y, x)}
      color="#000000"
      weight={1}
      fillOpacity={dotClass.opacity}
      fillColor={dotClass.color}
      radius={dotClass.size * dotInstance.scale}
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
