// ** MUI Imports
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const FallbackSpinner = ({ sx }) => {
  // ** Hook
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        ...sx
      }}
    >
      <Box
        component="img"
        src="/images/logos/geryA.png"
        sx={{
          height: '50px',
          width: 'auto', 
          mb: 2, 
        }}
      />
      <CircularProgress disableShrink sx={{ mt: 6 }} />
    </Box>
  );
}

export default FallbackSpinner;
