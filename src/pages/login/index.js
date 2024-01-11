import CustomTextField from 'src/components/Inputs/CustomTextField'
import Typography from '@mui/material/Typography'
import { AuthContext } from 'src/providers/AuthContext'

// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Imports
import {
  Card,
  CardContent,
  Button,
  Checkbox,
  TextField,
  Grid,
  IconButton,
  Box,
  InputAdornment,
  CardMedia
} from '@mui/material'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Styled Components
const LinkStyled = styled(Link)(({ theme }) => ({
  fontSize: '0.875rem',
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FormControlLabel = styled(MuiFormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary
  }
}))

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // ** Hooks
  const theme = useTheme()
  const auth = useAuth()
  const { companyName } = useContext(AuthContext)

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: '',
      password: '',
      rememberMe: false
    },
    validationSchema: yup.object({
      username: yup.string().required(),
      password: yup.string().min(5, 'Must be at least 6 characters').required(),
      rememberMe: yup.boolean()
    }),
    onSubmit: values => {
      auth.login({ ...values }, error => {
        console.log({ error })
        setErrorMessage(error)
      })
    }
  })

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      validation.handleSubmit()
    }
  }

  return (
    <>
      <Box className='content-center' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Card sx={{ zIndex: 1, width: '28rem', marginBottom: 10, marginTop: 'auto' }}>
          <CardMedia
            component='img'
            image='/images/logos/ArgusLogo.png'
            alt='ArgusERP'
            sx={{
              height: 60,
              backgroundColor: theme.palette.primary.main,
              objectFit: 'contain',
              p: 4
            }}
          />
          <CardContent sx={{ p: theme => `${theme.spacing(8, 9, 0)} !important` }} onKeyDown={handleKeyDown}>
            <Grid container spacing={5}>
              <Grid item xs={12}>
                <CustomTextField
                  readOnly
                  name='companyName'
                  value={companyName}
                  size='small'
                  fullWidth
                  label='Company Name'
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='username'
                  size='small'
                  fullWidth
                  label='Username'
                  value={validation.values.username}
                  type='text'
                  onChange={validation.handleChange}
                  error={validation.touched.username && Boolean(validation.errors.username)}
                  helperText={validation.touched.username && validation.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='password'
                  size='small'
                  fullWidth
                  label='Password'
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
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <FormControlLabel
                label='Remember Me'
                control={
                  <Checkbox
                    name='rememberMe'
                    checked={validation.values.rememberMe}
                    onChange={validation.handleChange}
                  />
                }
              />
              <LinkStyled href='/pages/auth/forgot-password-v1'>Forgot Password?</LinkStyled>
            </Box>
            <Button
              fullWidth
              size='large'
              type='submit'
              variant='contained'
              sx={{ mb: 7 }}
              onClick={validation.handleSubmit}
            >
              Login
            </Button>
          </CardContent>
        </Card>

        {/* Language Selection Section */}
        <Box sx={{ my: 5, display: 'flex', gap: 3, mt: 'auto' }}>
          <Typography variant='body2'>Argus offered in:</Typography>
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
}
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
