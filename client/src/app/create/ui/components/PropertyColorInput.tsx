"use client"

import { IconButton, Popover } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import { useState } from "react";
import { ColorResult, SketchPicker } from 'react-color'

export interface ColorInputProps {
    color: string;
    colorChangeHandler: (color: string) =>void
}

export default function({color, colorChangeHandler} : ColorInputProps) {
    const [currColor, setColor] = useState<string>(color)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    
    function handleChange(c : ColorResult) {
        setColor(c.hex)
        colorChangeHandler(c.hex)
    }



    return <>
        <IconButton onClick={(e)=>{setAnchorEl(e.currentTarget)}}>
            <CircleIcon style={{ color: currColor }} />
        </IconButton>
        <Popover
            open={anchorEl!==null}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            onClose={()=>{setAnchorEl(null)}}
        >
            <SketchPicker onChange={handleChange} color={currColor}/>
        </Popover>
    </>
}