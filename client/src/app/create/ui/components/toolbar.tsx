'use client';

import { useState, MouseEventHandler, useContext, useEffect } from 'react';
import styles from './toolbar.module.scss';
import IconButton from '../../../../components/iconButton';
import {
  EditorActions,
  EditorContext,
  ToolbarButtons,
} from 'context/EditorProvider';

function Toolbar() {
  const [selectedIconButton, setIconButton] = useState<ToolbarButtons | null>(
    null,
  );
  const editorContext = useContext(EditorContext);

  const handleSelectClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.select
        ? ToolbarButtons.select
        : null;

    setIconButton(tool);
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
    setIconButton(tool);
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
    setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handlePointClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.point
        ? ToolbarButtons.point
        : null;
    setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handleIconClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.icon
        ? ToolbarButtons.icon
        : null;
    setIconButton(tool);
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: tool,
      },
    });
  };

  const handlePathClick: MouseEventHandler = () => {
    let tool =
      editorContext.state.selectedTool !== ToolbarButtons.path
        ? ToolbarButtons.path
        : null;
    setIconButton(tool);
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
        selected={selectedIconButton === ToolbarButtons.select}
      />
      <IconButton
        id="toolbar-pan"
        iconType="solid"
        iconName="hand"
        variant="standard"
        onClick={handlePanClick}
        selected={selectedIconButton === ToolbarButtons.pan}
      />
      <IconButton
        id="toolbar-erase"
        iconType="solid"
        iconName="eraser"
        variant="standard"
        onClick={handleEraseClick}
        selected={selectedIconButton === ToolbarButtons.erase}
      />
      <IconButton
        id="toolbar-point"
        iconType="solid"
        iconName="circle"
        variant="standard"
        onClick={handlePointClick}
        selected={selectedIconButton === ToolbarButtons.point}
      />
      <IconButton
        id="toolbar-icon"
        iconType="solid"
        iconName="shapes"
        variant="standard"
        onClick={handleIconClick}
        selected={selectedIconButton === ToolbarButtons.icon}
      />
      <IconButton
        id="toolbar-path"
        iconType="solid"
        iconName="right-top-arrow-circle"
        variant="standard"
        onClick={handlePathClick}
        selected={selectedIconButton === ToolbarButtons.path}
      />
    </div>
  );
}

export default Toolbar;
