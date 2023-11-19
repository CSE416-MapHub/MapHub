'use client';
import { useContext } from 'react';
import styles from './Property.module.scss';
import PropertyPanel, { IPropertyPanelSectionProps } from './PropertyPanel';
import { EditorContext } from 'context/EditorProvider';

export interface IPropertiesProps {
  panels: Array<IPropertyPanelSectionProps>;
}

export default function () {
  const editorContext = useContext(EditorContext);

  let panels = editorContext.state.propertiesPanel;
  if (panels.length === 0) {
    // hidden state? lol
    return <></>;
  }

  return (
    <div className={styles['properties-container']}>
      {panels.map((p, i) => (
        <PropertyPanel {...p} key={i} />
      ))}
    </div>
  );
}
