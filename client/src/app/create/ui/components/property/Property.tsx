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
import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';

export interface IPropertiesProps {
  panels: Array<IPropertyPanelSectionProps>;
}

let ctr = 0;

export default function () {
  let editorContext = useContext(EditorContext);
  // const editorContextRef = useRef(editorContext);
  const [deleteModal, setDeleteModal] = useState<JSX.Element | null>(null);
  const [panels, setPanels] = useState<Array<IPropertyPanelSectionProps>>([]);

  function itemExists(
    targ: {
      type: TargetType;
      id: number;
      subid: string;
    } | null,
  ): boolean {
    let map = editorContext.state.map!;
    if (targ === null) return false;
    if (targ.type === TargetType.DOT) {
      // get the dot
      let dot = map.dotsData[targ.id];
      if (dot.dot.endsWith(DELETED_NAME)) {
        return false;
      }
    } else if (targ.type === TargetType.SYMBOL) {
      let sym = map.symbolsData[targ.id];
      if (sym.symbol.endsWith(DELETED_NAME)) {
        return false;
      }
    } else if (targ.type === TargetType.ARROW) {
      let arr = map.arrowsData[targ.id];
      if (arr.label.endsWith(DELETED_NAME)) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    ctr++;
    let currTarg = editorContext.state.selectedItem;
    if (!itemExists(currTarg) || currTarg === null) {
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
        setPanels(makeSymbolPanel(editorContext, currTarg.id, openDeleteModal));
        break;
      case TargetType.DOT:
        setPanels(makeDotPanel(editorContext, currTarg.id, openDeleteModal));
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
