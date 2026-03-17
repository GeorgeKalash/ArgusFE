import { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  IconButton,
  Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const CollapsibleCard = ({
  children,
  direction = 'down', // down | up | left | right
  defaultCollapsed = false,
  headerContent = null,
  widthWhenCollapsed = 60 // used for horizontal collapse
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const isHorizontal = direction === 'left' || direction === 'right';

  const getIcon = () => {
    if (direction === 'down')
      return collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />;

    if (direction === 'up')
      return collapsed ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />;

    if (direction === 'left')
      return collapsed ? <KeyboardArrowLeftIcon /> : <KeyboardArrowRightIcon />;

    if (direction === 'right')
      return collapsed ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />;
  };

  return (
    <Card
      sx={{
        my: 2,
        display: isHorizontal ? 'flex' : 'block',
        width: isHorizontal && collapsed ? widthWhenCollapsed : '100%',
        transition: 'width 0.3s ease'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: isHorizontal ? 'center' : 'space-between',
          alignItems: 'center',
          p: 1
        }}
      >
        {!isHorizontal && <Box>{headerContent}</Box>}

        <IconButton
          onClick={() => setCollapsed(prev => !prev)}
          size="small"
          sx={{
            backgroundColor: '#f0f0f0',
            '&:hover': { backgroundColor: '#d9d9d9' }
          }}
        >
          {getIcon()}
        </IconButton>
      </Box>

      <Collapse
        in={!collapsed}
        orientation={isHorizontal ? 'horizontal' : 'vertical'}
        timeout="auto"
        unmountOnExit
        sx={{
          flexGrow: 1
        }}
      >
        <CardContent>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

export default CollapsibleCard;