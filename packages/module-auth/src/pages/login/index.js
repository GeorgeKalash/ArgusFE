import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Typography from '@mui/material/Typography'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import { useState, useContext, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { Card, CardContent, Grid, Box, CardMedia } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import Icon from '@argus/shared-core/src/@core/components/icon'
import { useFormik } from 'formik'
import * as yup from 'yup'
import BlankLayout from '@argus/shared-core/src/@core/layouts/BlankLayout'
import ErrorWindow from '@argus/shared-ui/src/components/Shared/ErrorWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ChangePassword from '@argus/shared-ui/src/components/Shared/ChangePassword'
import axios from 'axios'
import OTPAuthentication from '@argus/shared-ui/src/components/Shared/OTPAuthentication'
import styles from './LoginPage.module.css'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import inputs from '@argus/shared-ui/src/components/Inputs/Inputs.module.css'

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.7rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const theme = useTheme()
  const auth = useAuth()
  const { companyName, setCompanyName, deployHost, validCompanyName } = useContext(AuthContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

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
        _labels: platformLabels,
        onClose: () => onClose()
      },
      expandable: false,
      closable: false,
      draggable: false,
      spacing: false
    })
  }

  const { apiUrl, languageId } = useAuth()

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

  useEffect(() => {
    validation.setFieldValue('companyName', companyName || '')
  }, [companyName])

 return (
  <>
    <Box className={styles.pageRoot}>
      <Box className={styles.centerZone}>
        <Card className={styles.loginCard}>
          <Box
            className={styles.loginCardHeader}
            sx={{ backgroundColor: theme.palette.primary.main }}
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
                  value={validation.values.companyName}
                  readOnly={!deployHost ? true : validCompanyName}
                  allowClear={deployHost}
                  label={platformLabels?.CompanyName || 'Company Name'}
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
                      label={platformLabels?.Username}
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
                      label={platformLabels?.password}
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
                <LinkStyled href='/forget-password/reset' className={styles.linksRow}>
                  {platformLabels?.ForgotPass}
                </LinkStyled>

                <CustomButton
                  fullWidth
                  type='submit'
                  variant='contained'
                  onClick={validation.handleSubmit}
                  disabled={!validCompanyName}
                  label={platformLabels?.Login}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box className={styles.middleZone}>
        <Box className={styles.languageRow}>
          <Typography variant='body2' className={styles.offered}>
            {platformLabels?.ArgusOfferedIn}
          </Typography>
          <Box className={styles.languageLinks}>
            <LinkStyled href='/pages/auth/login-en' className={styles.language}>English</LinkStyled>
            <LinkStyled href='/pages/auth/login-fr' className={styles.language}>Français</LinkStyled>
            <LinkStyled href='/pages/auth/login-ar' className={styles.language}>عربي</LinkStyled>
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
  </>
)

}

LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true
export default LoginPage
