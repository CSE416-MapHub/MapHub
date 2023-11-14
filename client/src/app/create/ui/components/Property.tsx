
import styles from "./Property.module.scss"
import PropertyPanel, { IPropertyPanelSectionProps } from "./PropertyPanel"



export interface IPropertiesProps {
    panels : Array<IPropertyPanelSectionProps>
}

export default function({ panels } : IPropertiesProps) {
    return (<div className={styles["properties-container"]}>
        {panels.map((p,i) => <PropertyPanel {...p} key={i}/>)}
    </div>)
}