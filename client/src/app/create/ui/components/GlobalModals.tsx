'use client';
import { useContext, useEffect, useState } from 'react';
import DeleteModal from './modals/deleteInstance';
import NewDotModal from './modals/newDotModal';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';

export default function () {
  const editorContext = useContext(EditorContext);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDotModal, setOpenDotModal] = useState(false);

  let createdDot = false;
  useEffect(() => {
    console.log('CHECKING IF WE CAN OPEN');
    if (
      editorContext.state.selectedTool === ToolbarButtons.dot &&
      editorContext.state.map &&
      editorContext.state.map.globalDotDensityData.length === 0 &&
      !openDotModal
    ) {
      setOpenDotModal(true);
    }
  });
  return (
    <>
      <DeleteModal
        open={openDeleteModal}
        // TODO: this
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => setOpenDeleteModal(false)}
        deleteType="Category"
        instanceToBeDeleted="Category X"
      />
      <NewDotModal
        open={openDotModal}
        onClose={() => {
          if (createdDot) {
            editorContext.dispatch({
              type: EditorActions.SET_TOOL,
              payload: {
                selectedTool: ToolbarButtons.dot,
              },
            });
          } else {
            editorContext.dispatch({
              type: EditorActions.SET_TOOL,
              payload: {
                selectedTool: null,
              },
            });
          }

          setOpenDotModal(false);
        }}
        onConfirm={function (
          name: string,
          opacity: number,
          size: number,
          color: string,
        ): void {
          let map = editorContext.state.map;
          if (!map) {
            throw new Error('Cannot make dot type without map');
          }
          let mapId = editorContext.state.map_id;
          let targetId = map.globalDotDensityData.length;
          editorContext.helpers.addDelta(
            editorContext,
            {
              type: DeltaType.CREATE,
              targetType: TargetType.GLOBAL_DOT,
              target: [mapId, targetId, -1],
              payload: {
                name,
                opacity,
                size,
                color,
              },
            },
            {
              type: DeltaType.DELETE,
              targetType: TargetType.GLOBAL_DOT,
              target: [mapId, targetId, -1],
              payload: {},
            },
          );
          createdDot = true;
        }}
      />
    </>
  );
}
