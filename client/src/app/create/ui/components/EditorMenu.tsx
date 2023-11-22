import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
} from '@mui/material';
import { ArrowRight } from '@mui/icons-material';
import { useContext, useState } from 'react';

export interface MenuProps {
  items: MenuSpec;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  isTopLevel?: boolean;
}

interface MenuSpecLeaf {
  onclick: () => void;
  disabled?: boolean;
}

interface MenuSpec {
  [Menu_Item: string]: MenuSpecLeaf | MenuSpec;
}

function isMenuSpec(o: any): o is MenuSpec {
  if (o.onclick !== undefined && typeof o.onclick === 'function') {
    return false;
  }
  return true;
}

function isMenuSpecLeaf(o: any): o is MenuSpecLeaf {
  if (o.onclick !== undefined && typeof o.onclick === 'function') {
    return true;
  }
  return false;
}

export default function EditorMenu({
  items,
  anchorEl,
  onClose,
  isTopLevel,
}: MenuProps) {
  const [subanchorEl, setSubanchorEl] = useState<HTMLElement | null>(null);
  const [submenuName, setSubmenuName] = useState<string>('');

  const handleClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    name: string,
  ) => {
    let t = items[name];
    if (isMenuSpec(t)) {
      setSubanchorEl(event.currentTarget);
      setSubmenuName(name);
    } else if (isMenuSpecLeaf(t)) {
      t.onclick();
    }
  };

  const handleSubmenuClose = () => {
    setSubanchorEl(null);
    setSubmenuName('');
  };

  let childMenu: JSX.Element = <></>;
  for (let key of Object.keys(items)) {
    let i = items[key];
    if (key === submenuName && isMenuSpec(i)) {
      childMenu = (
        <EditorMenu
          items={i}
          anchorEl={subanchorEl}
          onClose={handleSubmenuClose}
        />
      );
    }
  }

  function isOptionDisabled(a: any): boolean {
    if (isMenuSpecLeaf(a) && a.disabled) {
      return true;
    }
    return false;
  }
  return (
    <Popover
      open={true}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={
        isTopLevel
          ? {
              vertical: 'bottom',
              horizontal: 'left',
            }
          : {
              vertical: 'top',
              horizontal: 'right',
            }
      }
    >
      <Paper>
        <MenuList>
          {Object.keys(items).map(item => (
            <MenuItem
              key={item}
              onClick={e => handleClick(e, item)}
              disabled={isOptionDisabled(items[item])}
            >
              <ListItemText>{item}</ListItemText>
              {isMenuSpec(items[item]) ? (
                <ListItemIcon>
                  <ArrowRight fontSize="small" />
                </ListItemIcon>
              ) : (
                <></>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
      {childMenu}
    </Popover>
  );
}
