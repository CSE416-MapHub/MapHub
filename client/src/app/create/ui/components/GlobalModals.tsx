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
import NewSymbolModal from './modals/newSymbolModal';
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';

export default function () {
  const editorContext = useContext(EditorContext);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDotModal, setOpenDotModal] = useState(false);
  const [openSymbolModal, setOpenSymbolModal] = useState(false);

  let createdDot = false;
  useEffect(() => {
    // find nearest dot and symbol name
    let aDotName =
      editorContext.state.map?.globalDotDensityData.filter(
        x => x.name !== DELETED_NAME,
      )[0]?.name ?? DELETED_NAME;
    let aSymbolName =
      editorContext.state.map?.globalSymbolData.filter(
        x => x.name !== DELETED_NAME,
      )[0]?.name ?? DELETED_NAME;
    if (
      editorContext.state.selectedTool === ToolbarButtons.dot &&
      editorContext.state.map &&
      editorContext.state.lastInstantiated === DELETED_NAME &&
      !openDotModal
    ) {
      if (aDotName !== DELETED_NAME) {
        editorContext.dispatch({
          type: EditorActions.SET_LAST_INSTANTIATED,
          payload: {
            lastInstantiated: aDotName,
          },
        });
      } else {
        setOpenDotModal(true);
      }
    }
    if (
      editorContext.state.selectedTool === ToolbarButtons.symbol &&
      editorContext.state.map &&
      editorContext.state.lastInstantiated === DELETED_NAME &&
      !openSymbolModal
    ) {
      if (aSymbolName !== DELETED_NAME) {
        editorContext.dispatch({
          type: EditorActions.SET_LAST_INSTANTIATED,
          payload: {
            lastInstantiated: aSymbolName,
          },
        });
      } else {
        setOpenSymbolModal(true);
      }
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
          if (!createdDot) {
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
              target: [mapId, targetId, '-1'],
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
              target: [mapId, targetId, '-1'],
              payload: {},
            },
          );
          createdDot = true;
        }}
      />

      <NewSymbolModal
        open={openSymbolModal}
        onClose={function (created): void {
          console.log('CLOSING WITH CREATED ' + created);
          if (!created) {
            editorContext.dispatch({
              type: EditorActions.SET_TOOL,
              payload: {
                selectedTool: null,
              },
            });
          }
          setOpenSymbolModal(false);
        }}
      ></NewSymbolModal>
    </>
  );
}
