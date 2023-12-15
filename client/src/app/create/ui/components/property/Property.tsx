'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import styles from './Property.module.scss';
import PropertyPanel, { IPropertyPanelSectionProps } from './PropertyPanel';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';
import {
  makeArrowPanel,
  makeDotPanel,
  makeRegionPanel,
  makeSymbolPanel,
} from './createPanels';
import DeleteModal from '../modals/deleteInstance';

export interface IPropertiesProps {
  panels: Array<IPropertyPanelSectionProps>;
}

let ctr = 0;

export default function () {
  let editorContext = useContext(EditorContext);
  // const editorContextRef = useRef(editorContext);
  const [deleteModal, setDeleteModal] = useState<JSX.Element | null>(null);
  const [panels, setPanels] = useState<Array<IPropertyPanelSectionProps>>([]);
  useEffect(() => {
    ctr++;
    let currTarg = editorContext.state.selectedItem;
    if (currTarg === null) {
      setPanels([]);
      return;
    }
    let p;
    switch (currTarg.type) {
      case TargetType.LABELS:
      case TargetType.GLOBAL_CHOROPLETH:
      case TargetType.GLOBAL_CATEGORY:
      case TargetType.GLOBAL_SYMBOL:
      case TargetType.GLOBAL_DOT:
      case TargetType.REGION:
        p = makeRegionPanel(editorContext, currTarg.id, openDeleteModal);
        setPanels(p);
        break;
      case TargetType.SYMBOL:
        setPanels(makeSymbolPanel(editorContext, currTarg.id));
        break;
      case TargetType.DOT:
        setPanels(makeDotPanel(editorContext, currTarg.id));
        break;
      case TargetType.ARROW:
        setPanels(makeArrowPanel(editorContext, currTarg.id));
        break;
      case TargetType.GEOJSONDATA:
    }
  }, [editorContext.state]);

  function openDeleteModal(
    deleteType: string,
    instanceToBeDeleted: string,
    onConfirm: () => void,
  ) {
    setDeleteModal(
      <DeleteModal
        open={true}
        onClose={function (): void {
          setDeleteModal(null);
        }}
        onConfirm={function (): void {
          onConfirm();
        }}
        deleteType={deleteType}
        instanceToBeDeleted={instanceToBeDeleted}
      />,
    );
  }

  if (panels.length === 0) {
    // hidden state? lol
    return <></>;
  }

  return (
    <>
      <div className={styles['properties-container']}>
        {panels.map((p, i) => (
          <PropertyPanel {...p} key={'' + ctr + i} />
        ))}
      </div>
      {deleteModal}
    </>
  );
}
