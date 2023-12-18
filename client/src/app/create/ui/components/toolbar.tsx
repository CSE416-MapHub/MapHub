'use client';

import { useState, MouseEventHandler, useContext, useEffect } from 'react';
import styles from './toolbar.module.scss';
import IconButton from '../../../../components/iconButton';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';
import { MapType } from 'types/MHJSON';

function Toolbar() {
  // const [selectedIconButton, setIconButton] = useState<ToolbarButtons | null>(
  //   null,
  // );
  const editorContext = useContext(EditorContext);

  // useEffect(() => {
  //   if (editorContext.state.selectedTool !== selectedIconButton) {
  //     setIconButton(editorContext.state.selectedTool);
  //   }
  // });

  const handleSelectClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.select
        ? ToolbarButtons.select
        : null;

    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handlePanClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.pan
        ? ToolbarButtons.pan
        : null;
    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handleEraseClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.erase
        ? ToolbarButtons.erase
        : null;
    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handlePointClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.dot
        ? ToolbarButtons.dot
        : null;
    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handleIconClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.symbol
        ? ToolbarButtons.symbol
        : null;
    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handlePathClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.arrow
        ? ToolbarButtons.arrow
        : null;
    // setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  return (
    <div id="toolbar" className={styles.toolbar}>
      <IconButton
        id="toolbar-select"
        iconType="solid"
        iconName="pointer"
        variant="standard"
        onClick={handleSelectClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.select}
        disabled={editorContext.state.map === null}
      />
      <IconButton
        id="toolbar-pan"
        iconType="solid"
        iconName="hand"
        variant="standard"
        onClick={handlePanClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.pan}
        disabled={editorContext.state.map === null}
      />
      <IconButton
        id="toolbar-erase"
        iconType="solid"
        iconName="eraser"
        variant="standard"
        onClick={handleEraseClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.erase}
        disabled={editorContext.state.map === null}
      />
      <IconButton
        id="toolbar-point"
        iconType="solid"
        iconName="circle"
        variant="standard"
        onClick={handlePointClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.dot}
        disabled={editorContext.state.map === null}
      />
      <IconButton
        id="toolbar-icon"
        iconType="solid"
        iconName="shapes"
        variant="standard"
        onClick={handleIconClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.symbol}
        disabled={editorContext.state.map === null}
      />
      {editorContext.state.map?.mapType === MapType.FLOW && <IconButton
        id="toolbar-path"
        iconType="solid"
        iconName="right-top-arrow-circle"
        variant="standard"
        onClick={handlePathClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.arrow}
        disabled={editorContext.state.map === null}
      />}
    </div>
  );
}

export default Toolbar;
