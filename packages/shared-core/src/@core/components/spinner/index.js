import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const FallbackSpinner = ({ sx }) => {
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
        src= {require('@argus/shared-ui/src/components/images/logos/geryA.png').default.src}
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
