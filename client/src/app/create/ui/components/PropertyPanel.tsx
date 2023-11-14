
import { Divider, Typography } from "@mui/material";
import styles from "./Property.module.scss"
import PropertyInput, { IInputProps } from "./PropertyInput";


export interface IPropertyPanelSectionProps {
    name: string;
    items: Array<{
        name: string;
        input: IInputProps
    }>
}

export default function({name, items} : IPropertyPanelSectionProps) {
    return <div className={styles["properties-panel-container"]}>
        <Divider />
        {/* TODO: make this an h4! */}
        <Typography variant="h3">
            {name}
        </Typography>
        <Divider />
        <div style={{
            display: "grid",
            gridTemplateColumns: "47% 47%",
            gap: "6%"
        }}>
            {items.map((input, i) => {
                return <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gridColumn: input.input.short? "1" : "1/3"
                }}>
                    <Typography>
                        {input.name}: 
                    </Typography>
                    <PropertyInput key={i} {...input.input}/>
                </div>
            })}
        </div>
    </div>
}