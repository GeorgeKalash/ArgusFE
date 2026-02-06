import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import themeConfig from '@argus/shared-configs/src/configs/themeConfig'
import Direction from '@argus/shared-layouts/src/layouts/components/Direction'
import themeOptions from './ThemeOptions'
import GlobalStyling from './globalStyles'

const ThemeComponent = props => {
  const { settings, children } = props
  let theme = createTheme(themeOptions(settings, 'light'))
  if (themeConfig.responsiveFontSizes) {
    theme = responsiveFontSizes(theme)
  }

  return (
    <ThemeProvider theme={theme}>
      <Direction direction={settings.direction}>
        <CssBaseline />
        <GlobalStyles styles={() => GlobalStyling(theme)} />
        {children}
      </Direction>
    </ThemeProvider>
  )
}

export default ThemeComponent
