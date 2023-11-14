"use client"
import clsx from "clsx";
import style from "./Property.module.scss"
import { Typography } from "@mui/material";
import Button from "components/button";
import { useState } from "react";
import PropertyColorInput from "./PropertyColorInput";
import PropertyInputGradient from "./PropertyInputGradient";
import PropertySVGInput from "./PropertySVGInput";
import PropertyDotInput from "./PropertyDotInput";

export type PropertyPanelInputType = 
    | "number" 
    | "text" 
    | "dropdown" 
    | "delete"
    | "color" 
    | "svg" 
    | "dot" 
    | "gradient"


export interface IInputProps {
    type: PropertyPanelInputType;
    short: boolean;
    disabled: boolean;
    value: string | Array<string | [string, ()=>void]>;
    // contains either a string for the true selected dropdown option
    // or a modal
    auxiliaryComponent?: JSX.Element | string;
}


function getNameOfOption(o : string | [string , ()=>void]) : string {
    let k = o[1]
    if (typeof o[1] === "function")
        return o[0]
    else 
        return o as string
}

function getFunctionOfOption(o : string | [string , ()=>void] ) : (()=>void) {
    if (typeof o[1] === "function")
        return o[1]
    else 
        return ()=>{}
}

export default function(props : IInputProps) {
    // const [value, setValue] = useState<string>("")

    let inputField = <input />
    if (props.type === "number" || props.type === "text") {
        inputField = <input 
            type={props.type}
            value={props.value.toString()}
            disabled={props.disabled}
            // className={style["prop-input"]}
            className={clsx(style["prop-input"], props.short ? style["prop-input-short"] : style["prop-input-long"]) }
        />
    } else if (props.type === "dropdown") {
        inputField = <select
            disabled={props.disabled}
            className={clsx(style["prop-input"], props.short ? style["prop-input-short"] : style["prop-input-long"]) }
        >
            {(props.value as Array<string | [string, ()=>void]>).map((op) =>
                <option key={getNameOfOption(op)} selected={getNameOfOption(op) === props.auxiliaryComponent}>{getNameOfOption(op)}</option>)}
        </select>
    } else if (props.type === "delete") {
        inputField = <Button variant="error" onClick={getFunctionOfOption(props.value[0])}>{getNameOfOption(props.value[0])}</Button>
    } else if (props.type === "gradient"){
        inputField = <PropertyInputGradient 
            minValue={0}
            maxValue={100}
            minColor="#00FF00"
            maxColor="#FFFF00"
        />
    } else if (props.type === "color") {
        inputField = <PropertyColorInput color="#00FF00" colorChangeHandler={()=>{}}/>
    } else if (props.type === "svg") {
        inputField = <PropertySVGInput />
    } else if (props.type === "dot") {
        inputField = <PropertyDotInput items={props.value as Array<string>}/>
    } else {
        throw new Error("Bad input type " + props.type)
    }


    return <>
        {inputField}
        {typeof props.auxiliaryComponent === "function" ? props.auxiliaryComponent : <></>}
    </>
}