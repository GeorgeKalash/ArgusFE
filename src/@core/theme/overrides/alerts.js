// ** MUI Imports
import { lighten, darken } from '@mui/material/styles'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const Alert = mode => {
  const getColor = mode === 'dark' ? lighten : darken

  return {
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 5,
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(1.6)
          },
          '& a': {
            fontWeight: 500,
            color: 'inherit'
          }
        }),
        standardSuccess: ({ theme }) => ({
          color: getColor(theme.palette.success.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.success.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.success.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.success.main, 0.12)
          }
        }),
        standardInfo: ({ theme }) => ({
          color: getColor(theme.palette.info.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.info.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.info.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.info.main, 0.12)
          }
        }),
        standardWarning: ({ theme }) => ({
          color: getColor(theme.palette.warning.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.warning.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.warning.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.warning.main, 0.12)
          }
        }),
        standardError: ({ theme }) => ({
          color: getColor(theme.palette.error.main, 0.12),
          backgroundColor: hexToRGBA(theme.palette.error.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.error.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.error.main, 0.12)
          }
        }),
        outlinedSuccess: ({ theme }) => ({
          borderColor: theme.palette.success.main,
          color: getColor(theme.palette.success.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.success.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.success.main, 0.12)
          }
        }),
        outlinedInfo: ({ theme }) => ({
          borderColor: theme.palette.info.main,
          color: getColor(theme.palette.info.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.info.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.info.main, 0.12)
          }
        }),
        outlinedWarning: ({ theme }) => ({
          borderColor: theme.palette.warning.main,
          color: getColor(theme.palette.warning.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.warning.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.warning.main, 0.12)
          }
        }),
        outlinedError: ({ theme }) => ({
          borderColor: theme.palette.error.main,
          color: getColor(theme.palette.error.main, 0.12),
          '& .MuiAlertTitle-root': {
            color: getColor(theme.palette.error.main, 0.12)
          },
          '& .MuiAlert-icon': {
            color: getColor(theme.palette.error.main, 0.12)
          }
        }),
        filled: ({ theme }) => ({
          fontWeight: 400,
          color: theme.palette.common.white
        })
      }
    }
  }
}

export default Alert
