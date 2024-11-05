import CustomTextField from 'src/components/Inputs/CustomTextField'
import Typography from '@mui/material/Typography'
import { AuthContext } from 'src/providers/AuthContext'
import { useState, useContext } from 'react'
import Link from 'next/link'
import { useAuth } from 'src/hooks/useAuth'
import { Card, CardContent, Button, Grid, IconButton, Box, InputAdornment, CardMedia } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import { useFormik } from 'formik'
import * as yup from 'yup'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import ChangePassword from 'src/components/Shared/ChangePassword'
import axios from 'axios'
import OTPAuthentication from 'src/components/Shared/OTPAuthentication'

const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const theme = useTheme()
  const auth = useAuth()
  const { companyName } = useContext(AuthContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      password: '',
      rememberMe: false
    },
    validationSchema: yup.object({
      username: yup.string().required(),
      password: yup.string().min(5, platformLabels.PassConf).required(),
      rememberMe: yup.boolean()
    }),
    onSubmit: values => {
      auth.login({ ...values }, error => {
        const { loggedUser } = error

        if (error?.getUS2?.umcpnl) {
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
      width: 400,
      height: 400,
      spacing: false,
      title: platformLabels.OTPVerification
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
      width: 600,
      height: 400,
      spacing: false,
      title: platformLabels.ChangePassword
    })
  }

  const { apiUrl, languageId } = useAuth()

  const updateUmcpnl = async (loggedUser, getUS2) => {
    try {
      const user = getUS2
      const accessToken = loggedUser.accessToken
      if (!accessToken) {
        throw new Error('Failed to retrieve access token')
      }

      const updateUser = {
        ...user,
        umcpnl: false
      }

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
      }).then(res => {})
    } catch (error) {
      stackError({ message: error.message })
    }
  }

  return (
    Boolean(Object.keys(platformLabels)?.length) && (
      <>
        <Box className='content-center' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card sx={{ zIndex: 0, width: '28rem', marginBottom: 10, marginTop: 'auto' }}>
            <Box
              sx={{
                height: 60,
                backgroundColor: theme.palette.primary.main,
                p: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <CardMedia
                component='img'
                image='/images/logos/ArgusLogo.png'
                alt='ArgusERP'
                sx={{
                  height: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <CardContent sx={{ p: theme => `${theme.spacing(8, 9, 0)} !important` }} onKeyDown={handleKeyDown}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    readOnly
                    name='companyName'
                    value={companyName}
                    size='small'
                    fullWidth
                    label={platformLabels.CompanyName}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='username'
                    size='small'
                    fullWidth
                    label={platformLabels.Username}
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
                    label={platformLabels.password}
                    type={showPassword ? 'text' : 'password'}
                    value={validation.values.password}
                    onChange={validation.handleChange}
                    error={validation.touched.password && validation.errors.password}
                    helperText={validation.touched.password && validation.errors.password}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton
                            edge='end'
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={e => e.preventDefault()}
                          >
                            <Icon icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
              <Box
                sx={{
                  mb: 4,
                  mt: 4,
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
                }}
              >
                <LinkStyled href='/forget-password/reset'>{platformLabels.ForgotPass}</LinkStyled>
              </Box>
              <Button
                fullWidth
                size='large'
                type='submit'
                variant='contained'
                sx={{ mb: 7 }}
                onClick={validation.handleSubmit}
              >
                {platformLabels.Login}
              </Button>
            </CardContent>
          </Card>

          {/* Language Selection Section */}
          <Box sx={{ my: 5, display: 'flex', gap: 3, mt: 'auto' }}>
            <Typography variant='body2'>{platformLabels.ArgusOfferedIn}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
              <LinkStyled href='/pages/auth/login-en' sx={{ color: 'red' }}>
                English
              </LinkStyled>
              <LinkStyled href='/pages/auth/login-fr' sx={{ color: 'red' }}>
                Français
              </LinkStyled>
              <LinkStyled href='/pages/auth/login-ar' sx={{ color: 'red' }}>
                عربي
              </LinkStyled>
            </Box>
          </Box>

          {/* Footer Section */}
          <Box component='footer' sx={{ mt: 'auto' }}>
            © {new Date().getFullYear()} Argus. All rights reserved. 3.1.8 API: 2.8.8
          </Box>
        </Box>
        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      </>
    )
  )
}
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
