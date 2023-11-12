"use client"


import { Divider, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography } from "@mui/material"
import { ContentCut, ContentCopy, ContentPaste } from "@mui/icons-material"
import styles from "./EditorRibbon.module.css"
import { useState } from "react"
import EditorMenu, {MenuProps} from "./EditorMenu"


const menus  = {
    File: {
        Import : {
            "Import File From Local Desktop":  ()=>{},
            "Import User Owned Maps":()=>{},
        },
        Export : {
            "Export As PNG": ()=>{},
            "Export As SVG": ()=>{},
            "Export As JSON": ()=>{}
        },
        Publish: ()=>{alert("Published!")}
    },
    View: {
        "Map Label Multi Select": ()=>{},
        "Choropleth Label Select": ()=>{}
    },
    Map: {}
} 



export default function() {
    const [openMenu, setOpenMenu] = useState<MenuProps | null>(null)

    function handleMenuClose() {
        setOpenMenu(null)
    }



    return (<div className={styles["ribbon-container"]}>

        <div className={styles["dropdowns"]}>
            <Typography onClick={(e)=>{
                setOpenMenu({items: menus.File, anchorEl: e.currentTarget, onClose: handleMenuClose})
            }}> File </Typography>
            <Typography onClick={(e)=>{
                setOpenMenu({items: menus.View, anchorEl: e.currentTarget, onClose: handleMenuClose})
            }}> View </Typography>
                        <Typography onClick={(e)=>{
                setOpenMenu({items: menus.Map, anchorEl: e.currentTarget, onClose: handleMenuClose})
            }}> Map </Typography>
        </div>
        <div className={styles["map-title"]}>

        </div>
        <div className={styles["undo-redo"]}>

        </div>
        {openMenu ? <EditorMenu {...openMenu} /> : <></>}
    </div>)
}