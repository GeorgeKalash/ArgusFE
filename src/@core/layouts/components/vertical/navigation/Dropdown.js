import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/router';

function Dropdown({ Image, TooltipTitle, onClickAction, name, map, navCollapsed }) {

  const router = useRouter();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const OpenItems = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box sx={{
        display: navCollapsed ? 'none' : 'flex',
        flexDirection: 'row',
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: '#231f20',
        borderRadius: '4px',
        marginLeft: '10px',
        padding: '0px',
      }}>
        <div
          style={{
            height:'30px',
            paddingTop: '3px',
            paddingLeft: '5px',
            margin: '0px',
          }}
        >
          {Image}
        </div>
        <Tooltip title={TooltipTitle}>
          <IconButton
            onClick={OpenItems}
            size="small"
          >
            <ExpandMoreIcon style={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {map && map.map((element, index) => (
          <MenuItem key={index} onClick={() => onClickAction(element)}>
            <div
              style={{ display: navCollapsed ? 'none' : 'flex' }}
            >
              {element.name}
            </div>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default Dropdown;
