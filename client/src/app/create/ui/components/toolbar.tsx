'use client'

import { useState, MouseEventHandler, useContext } from 'react';
import styles from './toolbar.module.scss';
import IconButton from '../../../../components/iconButton';
import { EditorActions, EditorContext, ToolbarButtons } from 'context/EditorProvider';



function Toolbar() {
  // const [ selectedIconButton, setIconButton ] = useState<ToolbarButtons | null>(null);
  const editorContext = useContext(EditorContext)


  const handleSelectClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.select
        ? ToolbarButtons.select
        : null
      }
    })

  };

  const handlePanClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.pan
        ? ToolbarButtons.pan
        : null
      }
    })
  };

  const handleEraseClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.erase
        ? ToolbarButtons.erase
        : null
      }
    })
  };

  const handlePointClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.point
        ? ToolbarButtons.point
        : null
      }
    })
  };

  const handleIconClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.icon
        ? ToolbarButtons.icon
        : null
      }
    })
  };

  const handlePathClick: MouseEventHandler  = () => {
    editorContext.dispatch({
      type: EditorActions.SET_TOOL,
      payload: {
        selectedTool: editorContext.state.selectedTool !== ToolbarButtons.path
        ? ToolbarButtons.path
        : null
      }
    })
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
      />
      <IconButton 
        id="toolbar-pan"
        iconType="solid"
        iconName="hand"
        variant="standard"
        onClick={handlePanClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.pan}
      />
      <IconButton
        id="toolbar-erase"
        iconType="solid"
        iconName="eraser"
        variant="standard"
        onClick={handleEraseClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.erase}  
      />
      <IconButton
        id="toolbar-point"
        iconType="solid"
        iconName="circle"
        variant="standard"
        onClick={handlePointClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.point}
      />
      <IconButton
        id="toolbar-icon"
        iconType="solid"
        iconName="shapes"
        variant="standard"
        onClick={handleIconClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.icon}
        />
      <IconButton
        id="toolbar-path"
        iconType="solid"
        iconName="right-top-arrow-circle"
        variant="standard"
        onClick={handlePathClick}
        selected={editorContext.state.selectedTool === ToolbarButtons.path}
      />
    </div>
  );
}

export default Toolbar;
