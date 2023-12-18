import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { CircleMarker, Rectangle, SVGOverlay, useMap } from 'react-leaflet';
import { useContext, useEffect, useRef, useState } from 'react';
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
  let editorContext = useContext(EditorContext);
  const map = useMap();
  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(symbolInstance.x);
  const [y, setY] = useState(symbolInstance.y);
  const [rerender, setRerender] = useState(2);

  // function changeBounds() {
  //   console.log('CHANGING BOUNDS');
  //   console.log(bounds);
  //   mapsz = map.getSize();
  //   mapbds = map.getBounds();
  //   zoom = map.getZoom();

  //   let newBounds: [[number, number], [number, number]] = [
  //     [y + zoom * scale, x - zoom * scale],
  //     [y - zoom * scale, x + zoom * scale],
  //   ];
  //   console.log(newBounds);
  //   setBounds(newBounds);
  //   setRerender(rerender + 1);
  // }

  useEffect(() => {
    // console.log('adding evt lsitner');
    // map.addEventListener('zoomend', changeBounds);
    // return () => {
    //   map.removeEventListener('zoomend', changeBounds);
    // };
  }, []);

  function handleClick(ev: L.LeafletMouseEvent) {
    if (editorContext.state.selectedTool === ToolbarButtons.select) {
      let loadedMap: MHJSON;
      if (editorContext.state.map) {
        loadedMap = editorContext.state.map;
      } else {
        return;
      }
      console.log('HANDLING SOMETHING IN SYMBOL');
      editorContext.dispatch({
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
      editorContext.helpers.addDelta(
        editorContext,
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.SYMBOL,
          target: [editorContext.state.map_id, id, '-1'],
          payload: {
            x,
            y,
          },
        },
        {
          type: DeltaType.UPDATE,
          targetType: TargetType.SYMBOL,
          target: [editorContext.state.map_id, id, '-1'],
          payload: {
            x: symbolInstance.x,
            y: symbolInstance.y,
          },
        },
      );
    }
  }

  function deleteSelf() {
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.DELETE,
        targetType: TargetType.SYMBOL,
        target: [editorContext.state.map_id, id, '-1'],
        payload: {},
      },
      {
        type: DeltaType.CREATE,
        targetType: TargetType.SYMBOL,
        target: [editorContext.state.map_id, id, '-1'],
        payload: structuredClone(symbolInstance),
      },
    );
  }

  function handleMouseDown(ev: L.LeafletMouseEvent) {
    const thisIsSelected =
      editorContext.state.selectedItem &&
      editorContext.state.selectedItem.id === id &&
      editorContext.state.selectedItem.type == TargetType.SYMBOL &&
      editorContext.state.selectedTool === ToolbarButtons.select;
    if (thisIsSelected) {
      setDragging(true);
    }
    if (editorContext.state.selectedTool === ToolbarButtons.erase) {
      deleteSelf();
    }
  }

  function handleMouseMove(ev: L.LeafletMouseEvent) {
    if (dragging) {
      setX(ev.latlng.lng);
      setY(ev.latlng.lat);
      setRerender(rerender + 1);
    }
    if (!dragging && editorContext.state.isDeleting) {
      deleteSelf();
    }
  }

  let mapbox = editorContext.state.mapDetails.bbox;
  let scale = symbolInstance.scale;
  let DEFAULT_SZ = Math.min(mapbox[2], mapbox[3]) / 10;
  let bounds: [[number, number], [number, number]] = [
    [y + DEFAULT_SZ * scale, x - DEFAULT_SZ * scale],
    [y - DEFAULT_SZ * scale, x + DEFAULT_SZ * scale],
  ];

  return (
    <>
      <Rectangle
        className="map-symbol"
        key={rerender + 'symbol' + id}
        bounds={bounds}
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
      <SVGOverlay key={rerender * -1 + 'symbol' + id} bounds={bounds}>
        {(() => {
          let parser = new DOMParser();
          let svgEl: HTMLElement = parser.parseFromString(
            symbolClass.svg,
            'image/svg+xml',
          ).documentElement;

          svgEl.setAttribute('width', '100%');
          svgEl.setAttribute('height', '100%');
          // find the viewbox. if theres no viewbox, throw an error
          // let viewbox = svgEl.getAttribute('viewBox');
          // if (viewbox === null) {
          //   throw new Error('null viewbox');
          // }
          // let svgChildren = Array.from(svgEl.children);

          return <g ref={ref => ref?.appendChild(svgEl)}></g>;
        })()}
      </SVGOverlay>
    </>
  );
}
