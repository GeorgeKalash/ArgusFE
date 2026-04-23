import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Typography from '@mui/material/Typography'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { useState, useContext, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { Card, CardContent, Grid, Box, CardMedia } from '@mui/material'
import { styled, useTheme, createTheme, ThemeProvider } from '@mui/material/styles'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useFormik } from 'formik'
import * as yup from 'yup'
import BlankLayout from '@argus/shared-core/src/@core/layouts/BlankLayout'
import ErrorWindow from '@argus/shared-ui/src/components/Shared/ErrorWindow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ChangePassword from '@argus/shared-ui/src/components/Shared/ChangePassword'
import axios from 'axios'
import OTPAuthentication from '@argus/shared-ui/src/components/Shared/OTPAuthentication'
import styles from './LoginPage.module.css'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import inputs from '@argus/shared-ui/src/components/Inputs/Inputs.module.css'
import { KVSRepository } from '@argus/repositories/src/repositories/KVSRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useTranslation } from 'react-i18next'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.7rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const Languages = {
  ENGLISH: 1,
  ARABIC: 2,
  FRENCH: 3
}

const languageMap = {
  1: { code: 'en', direction: 'ltr' },
  2: { code: 'ar', direction: 'rtl' },
  3: { code: 'fr', direction: 'ltr' }
}

const ltrCache = createCache({
  key: 'mui-ltr',
  stylisPlugins: [prefixer]
})

const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin]
})

const LoginPage = () => {
  const { getRequest } = useContext(RequestsContext)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [selectedLanguageId, setSelectedLanguageId] = useState(Languages.ENGLISH)
  const [localPlatformLabels, setLocalPlatformLabels] = useState(null)

  const theme = useTheme()
  const auth = useAuth()
  const { companyName, setCompanyName, deployHost, validCompanyName } = useContext(AuthContext)
  const { stack } = useWindow()
  const { i18n } = useTranslation()
  const { apiUrl, languageId } = useAuth()
  const { platformLabels } = useContext(ControlContext)

  const translatedLabels = useMemo(() => {
    return localPlatformLabels || platformLabels || {}
  }, [localPlatformLabels, platformLabels])

  const currentLanguage = languageMap[selectedLanguageId] || languageMap[Languages.ENGLISH]
  const currentDirection = currentLanguage.direction
  const currentLangCode = currentLanguage.code

  const directionalTheme = useMemo(() => {
    return createTheme({
      ...theme,
      direction: currentDirection
    })
  }, [theme, currentDirection])

  const currentCache = useMemo(() => {
    return currentDirection === 'rtl' ? rtlCache : ltrCache
  }, [currentDirection])

  const validation = useFormik({
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
      accountId: '',
      companyName: ''
    },
    validationSchema: yup.object({
      username: yup.string().required(),
      password: yup.string().required(),
      rememberMe: yup.boolean()
    }),
    onSubmit: values => {
      auth.login({ ...values }, error => {
        const { loggedUser } = error
        if (error?.signIn3?.forcePasswordReset) {
          const onClose = async () => {}
          openForm(error.username, loggedUser, onClose)
        } else if (error?.getUS2?.umcpnl) {
          const onClose = async () => {
            await updateUmcpnl(loggedUser, error?.getUS2)
          }
          openForm(error.username, loggedUser, onClose)
        } else if (error?.getUS2?.is2FAEnabled) {
          viewOTP(loggedUser)
        } else setErrorMessage(error)
      })

      setLocalPlatformLabels(null)
    }
  })

  function viewOTP(loggedUser) {
    stack({
      Component: OTPAuthentication,
      props: {
        formValidation: validation,
        loggedUser,
        onClose: () => auth.EnableLogin(loggedUser)
      },
      expandable: false,
      spacing: false
    })
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      validation.handleSubmit()
    }
  }

  function openForm(username, loggedUser, onClose) {
    stack({
      Component: ChangePassword,
      props: {
        reopenLogin: true,
        username,
        loggedUser,
        _labels: translatedLabels,
        onClose: () => onClose()
      },
      expandable: false,
      closable: true,
      draggable: false,
      spacing: false
    })
  }

  const updateUmcpnl = async (loggedUser, getUS2) => {
    try {
      const user = getUS2
      const accessToken = loggedUser.accessToken
      if (!accessToken) throw new Error('Failed to retrieve access token')

      const updateUser = { ...user, umcpnl: false }
      var bodyFormData = new FormData()
      bodyFormData.append('record', JSON.stringify(updateUser))

      await axios({
        method: 'POST',
        url: `${apiUrl}SY.asmx/setUS`,
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'multipart/form-data',
          LanguageId: languageId
        },
        data: bodyFormData
      })
    } catch (error) {
      stackError({ message: error.message })
    }
  }

  const mapKeyValueListToObject = (list = []) =>
    Object.fromEntries(list.map(({ key, value }) => [key, value]))

  const applyLanguage = async language => {
    const selected = languageMap[language]
    if (!selected) return

    const res = await getRequest({
      extension: KVSRepository.getPlatformLabels,
      parameters: `_dataset=${ResourceIds.Common}&_language=${language}`
    })

    setLocalPlatformLabels(mapKeyValueListToObject(res?.list || []))
    setSelectedLanguageId(language)

    await i18n.changeLanguage(selected.code)

    if (typeof document !== 'undefined') {
      document.documentElement.dir = selected.direction
      document.documentElement.lang = selected.code
      document.body.dir = selected.direction
      document.body.lang = selected.code
    }
  }

  useEffect(() => {
    validation.setFieldValue('companyName', companyName || '')
  }, [companyName])

  useEffect(() => {
    const defaultLanguage = auth?.user?.languageId || Languages.ENGLISH
    applyLanguage(defaultLanguage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?.languageId])

 return (
  <CacheProvider value={currentCache}>
    <ThemeProvider theme={directionalTheme}>
      <Box dir={currentDirection} lang={currentLangCode} key={currentDirection}>
        <Box className={styles.pageRoot}>
          <Box className={styles.centerZone}>
            <Card className={styles.loginCard}>
              <Box
                className={styles.loginCardHeader}
                sx={{ backgroundColor: directionalTheme.palette.primary.main }}
              >
                <CardMedia
                  component='img'
                  image={require('@argus/shared-ui/src/components/images/logos/ArgusLogo.png').default.src}
                  alt='ArgusERP'
                  sx={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </Box>

              <CardContent className={styles.cardContent} onKeyDown={handleKeyDown}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='companyName'
                      size='small'
                      fullWidth
                      dir={currentDirection}
                      value={validation.values.companyName}
                      readOnly={!deployHost ? true : validCompanyName}
                      allowClear={deployHost}
                      label={translatedLabels?.CompanyName || 'Company Name'}
                      onChange={validation.handleChange}
                      onKeyDown={e => {
                    if (e.key == 'Enter') e.target.blur()
                      }}
                      onBlur={
                        deployHost
                          ? e => {
                              const value = e?.target?.value || ''
                              setCompanyName(value)
                            }
                          : undefined
                      }
                      onClear={() => {
                        setCompanyName('')
                        validation.setFieldValue('companyName', '')
                      }}
                    />
                  </Grid>

                  {validCompanyName && (
                    <>
                      <Grid item xs={12}>
                        <CustomTextField
                          name='username'
                          size='small'
                          fullWidth
                          dir={currentDirection}
                          label={translatedLabels?.Username}
                          value={validation.values.username}
                          type='text'
                          onChange={validation.handleChange}
                          onClear={() => validation.setFieldValue('username', '')}
                          error={validation.touched.username && Boolean(validation.errors.username)}
                          helperText={validation.touched.username && validation.errors.username}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <CustomTextField
                          name='password'
                          size='small'
                          fullWidth
                          label={translatedLabels?.password}
                          type={showPassword ? 'text' : 'password'}
                          value={validation.values.password}
                          onChange={validation.handleChange}
                      error={validation.touched.password && validation.errors.password}
                          helperText={validation.touched.password && validation.errors.password}
                          endIcons={[
                            <Icon
                              className={inputs.icon}
                              icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}
                              onClick={() => setShowPassword(prev => !prev)}
                              onMouseDown={e => e.preventDefault()}
                            />
                          ]}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                {validCompanyName && (
                  <>
                    <LinkStyled href='/forget-password' className={styles.linksRow}>
                      {translatedLabels?.ForgotPass}
                    </LinkStyled>

                    <CustomButton
                      fullWidth
                      type='submit'
                      variant='contained'
                      onClick={validation.handleSubmit}
                      disabled={!validCompanyName}
                      label={translatedLabels?.Login}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box className={styles.middleZone}>
            <Box className={styles.languageRow}>
              <Typography variant='body2' className={styles.offered}>
                {translatedLabels?.ArgusOfferedIn}
              </Typography>
              <Box className={styles.languageLinks}>
                <span className={styles.language} onClick={() => applyLanguage(Languages.ENGLISH)}>
                  English
                </span>
                <span className={styles.language} onClick={() => applyLanguage(Languages.FRENCH)}>
                  Français
                </span>
                <span className={styles.language} onClick={() => applyLanguage(Languages.ARABIC)}>
                  عربي
                </span>
              </Box>
            </Box>
          </Box>

          <Box className={styles.bottomZone}>
            <Box component='footer' className={styles.footer}>
              © {new Date().getFullYear()} Argus. All rights reserved. 3.1.8 API: 2.8.8
            </Box>
          </Box>
        </Box>

        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      </Box>
    </ThemeProvider>
  </CacheProvider>
)

}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true
export default LoginPage
