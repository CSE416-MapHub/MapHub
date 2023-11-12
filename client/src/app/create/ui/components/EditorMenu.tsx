import { ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popover } from "@mui/material";
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react"

export interface MenuProps {
    items : MenuSpec,
    anchorEl : HTMLElement | null,
    onClose: ()=>void,
}

interface MenuSpec {
    [Menu_Item : string] : (()=>void) | MenuSpec
}


function isMenuSpec(o : MenuSpec | (()=> void)) : o is MenuSpec {
    if (typeof o !== "function") {
        return true
    }
    return false
}


export default function EditorMenu({items, anchorEl, onClose} : MenuProps) {
    const [subanchorEl, setSubanchorEl] = useState<HTMLElement | null>(null)
    const [submenuName, setSubmenuName] = useState<string>("")

    const handleClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, name: string) => {
        let t = items[name]
        if (isMenuSpec(t)) {
            setSubanchorEl(event.currentTarget);
            setSubmenuName(name)
        } else if (typeof t === "function") {
            t()
        }

    };

    const handleSubmenuClose = () => {
        setSubanchorEl(null);
        setSubmenuName("")
    };


    let childMenu : JSX.Element = <></>
    for (let key of Object.keys(items)) {
        let i = items[key]
        if (key === submenuName && isMenuSpec(i)) {
            childMenu = <EditorMenu items={i} anchorEl={subanchorEl} onClose={handleSubmenuClose}/>
        }
    }
    return (      
    <Popover
        open={true}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
    >
        <Paper>
            <MenuList>
                {Object.keys(items).map((item) => 
                    <MenuItem key={item} onClick={(e) => handleClick(e, item)}>
                        <ListItemText>{item}</ListItemText>
                        {Object.keys(items[item]).length > 1? 
                            <ListItemIcon>
                                <ArrowRightIcon fontSize="small" />
                            </ListItemIcon> 
                            : <></>
                        }
                    </MenuItem>  
                )}
            </MenuList>
        </Paper>
        {childMenu}
    </Popover>
    )
}