// ** React Imports
import { useState } from 'react'

// ** Next Imports
import Link from 'next/link'
import Image from 'next/image'

// ** MUI Imports
import {
  Card,
  CardContent,
  Button,
  Checkbox,
  TextField,
  InputLabel,
  IconButton,
  Box,
  FormControl,
  useMediaQuery,
  OutlinedInput,
  InputAdornment,
  Typography,
  CardMedia,
} from '@mui/material'
import MuiCard from '@mui/material/Card'
import MuiFormControlLabel from '@mui/material/FormControlLabel'
import { styled, useTheme } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSession, signIn, signOut, getCsrfToken } from 'next-auth/react'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import useBgColor from 'src/@core/hooks/useBgColor'
import { useSettings } from 'src/@core/hooks/useSettings'

// ** Configs
import themeConfig from 'src/configs/themeConfig'

// ** Layout Import
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Demo Imports
import FooterIllustrationsV2 from 'src/views/pages/auth/FooterIllustrationsV2'

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

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().min(5).required()
})

const defaultValues = {
  password: 'admin',
  email: 'admin@materio.com'
}

const LoginPage = () => {

  const [values, setValues] = useState({
    password: '',
    showPassword: false
  })

  // ** Hooks
  const auth = useAuth()
  const theme = useTheme()
  const bgColors = useBgColor()
  const { settings } = useSettings()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  // ** Vars
  const { skin } = settings

  const {
    control,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const handleChange = prop => event => {
    setValues({ ...values, [prop]: event.target.value })
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const onSubmit = async data => {
    const { email, password } = data
    console.log({ email, password })
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      if (res?.error) {
        console.log({ autherror: res?.error })
        throw new Error(res.error)

        // setMessage(res.error)
      } else {
        return router.push('/dashboards/analytics/')
      }
    } catch (error) {
      setError('email', {
        type: 'manual',
        message: 'Email or Password is invalid'
      })
    }
  }

  return (
    <Box className='content-center'>
      <Card sx={{ zIndex: 1, width: '28rem' }}>
        <CardMedia
          component="img"
          image="/images/logos/ArgusLogo.png"
          alt="Paella dish"
          sx={{
            height: 60,
            backgroundColor: theme.palette.primary.main,
            objectFit: 'contain',
            p: 2,
          }}
        />
        <CardContent sx={{ p: theme => `${theme.spacing(8, 9, 0)} !important` }}>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <TextField autoFocus fullWidth id='email' label='Email' sx={{ mb: 4 }} />
            <FormControl fullWidth>
              <InputLabel htmlFor='auth-login-password'>Password</InputLabel>
              <OutlinedInput
                label='Password'
                value={values.password}
                id='auth-login-password'
                onChange={handleChange('password')}
                type={values.showPassword ? 'text' : 'password'}
                endAdornment={
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={handleClickShowPassword}
                      onMouseDown={e => e.preventDefault()}
                      aria-label='toggle password visibility'
                    >
                      <Icon icon={values.showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Box
              sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <FormControlLabel control={<Checkbox />} label='Remember Me' />
              <LinkStyled href='/pages/auth/forgot-password-v1'>Forgot Password?</LinkStyled>
            </Box>
            <Button fullWidth size='large' type='submit' variant='contained' sx={{ mb: 7 }}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* <FooterIllustrationsV1 /> */}
    </Box>
  )
}
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>
LoginPage.guestGuard = true

export default LoginPage
