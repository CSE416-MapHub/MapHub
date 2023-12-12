import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { CircleMarker, Rectangle, SVGOverlay, useMap } from 'react-leaflet';
import { useContext, useRef, useState } from 'react';
import { ISymbolInstance, ISymbolProps, MHJSON } from 'types/MHJSON';
import { DeltaType, TargetType } from 'types/delta';
import L from 'leaflet';

interface SymbolProps {
  symbolInstance: ISymbolInstance;
  symbolClass: ISymbolProps;
  id: number;
  mapClickHandler: (ev: L.LeafletMouseEvent) => void;
}

const DEFAULT_SZ = 100;

export default function ({
  symbolInstance,
  symbolClass,
  id,
  mapClickHandler,
}: SymbolProps) {
  let editorContextRef = useContext(EditorContext);

  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(symbolInstance.x);
  const [y, setY] = useState(symbolInstance.y);
  const [rerender, setRerender] = useState(2);
  const map = useMap();

  function handleClick(ev: L.LeafletMouseEvent) {
    if (editorContextRef.state.selectedTool === ToolbarButtons.select) {
      let loadedMap: MHJSON;
      if (editorContextRef.state.map) {
        loadedMap = editorContextRef.state.map;
      } else {
        return;
      }
      console.log('HANDLING SOMETHING IN SYMBOL');
      editorContextRef.dispatch({
        type: EditorActions.SET_SELECTED,
        payload: {
          selectedItem: {
            type: TargetType.SYMBOL,
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
          targetType: TargetType.SYMBOL,
          target: [editorContextRef.state.map_id, id, '-1'],
          payload: {
            x,
            y,
          },
        },
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.SYMBOL,
          target: [editorContextRef.state.map_id, id, '-1'],
          payload: {
            x: symbolInstance.x,
            y: symbolInstance.y,
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
        targetType: TargetType.SYMBOL,
        target: [editorContextRef.state.map_id, id, '-1'],
        payload: {},
      },
      {
        type: DeltaType.CREATE,
        targetType: TargetType.SYMBOL,
        target: [editorContextRef.state.map_id, id, '-1'],
        payload: structuredClone(symbolInstance),
      },
    );
  }

  function handleMouseDown(ev: L.LeafletMouseEvent) {
    const thisIsSelected =
      editorContextRef.state.selectedItem &&
      editorContextRef.state.selectedItem.id === id &&
      editorContextRef.state.selectedItem.type == TargetType.SYMBOL &&
      editorContextRef.state.selectedTool === ToolbarButtons.select;
    if (thisIsSelected) {
      setDragging(true);
    }
    if (editorContextRef.state.selectedTool === ToolbarButtons.erase) {
      deleteSelf();
    }
  }

  function handleMouseMove(ev: L.LeafletMouseEvent) {
    if (dragging) {
      setX(ev.latlng.lng);
      setY(ev.latlng.lat);
      setRerender(rerender + 1);
    }
    if (!dragging && editorContextRef.state.isDeleting) {
      deleteSelf();
    }
  }

  let mapsz = map.getSize();
  let mapbds = map.getBounds();
  let lngPerPx = (mapbds.getEast() - mapbds.getWest()) / mapsz.x;
  let latPerPx = (mapbds.getSouth() - mapbds.getNorth()) / mapsz.y;
  let scale = symbolInstance.scale;

  return (
    <>
      <Rectangle
        className="map-symbol"
        key={rerender + 'symbol' + id}
        bounds={[
          [
            y + (latPerPx * DEFAULT_SZ * scale) / 2,
            x - (lngPerPx * DEFAULT_SZ * scale) / 2,
          ],
          [
            y - (latPerPx * DEFAULT_SZ * scale) / 2,
            x + (lngPerPx * DEFAULT_SZ * scale) / 2,
          ],
        ]}
        fillOpacity={0}
        stroke={false}
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
      ></Rectangle>
      <SVGOverlay
        key={rerender * -1 + 'symbol' + id}
        bounds={[
          [
            y + (latPerPx * DEFAULT_SZ * scale) / 2,
            x - (lngPerPx * DEFAULT_SZ * scale) / 2,
          ],
          [
            y - (latPerPx * DEFAULT_SZ * scale) / 2,
            x + (lngPerPx * DEFAULT_SZ * scale) / 2,
          ],
        ]}
      >
        {(() => {
          let parser = new DOMParser();
          let svgEl: HTMLElement = parser.parseFromString(
            symbolClass.svg,
            'image/svg+xml',
          ).documentElement;

          // find the viewbox. if theres no viewbox, throw an error
          let viewbox = svgEl.getAttribute('viewBox');
          if (viewbox === null) {
            throw new Error('null viewbox');
          }
          let svgChildren = Array.from(svgEl.children);

          return (
            <svg viewBox={viewbox} width="100%" height="100%">
              {svgChildren.map((el, i) => (
                <g key={'' + i} ref={ref => ref?.appendChild(el)}></g>
              ))}
            </svg>
          );
        })()}
      </SVGOverlay>
    </>
  );
}
