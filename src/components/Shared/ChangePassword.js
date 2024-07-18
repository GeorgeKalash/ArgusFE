import React, { useContext, useState } from 'react'
import { Box, Button, Grid, IconButton, InputAdornment, LinearProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useAuth } from 'src/hooks/useAuth'
import axios from 'axios'
import { useError } from 'src/error'

const ChangePassword = ({
  _labels,
  reopenLogin = false,
  loggedUser: propLoggedUser,
  window,
  username = '',
  handleLogout,
  onClose
}) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [score, setScore] = useState(0)
  const [color, setColor] = useState('white')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const { stack: stackError } = useError()
  const auth = useAuth()

  const { encryptePWD, loggedUser: authLoggedUser } = useAuth()

  const loggedUser = propLoggedUser ? propLoggedUser : authLoggedUser

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      username: username ? username : auth?.user?.username,
      password: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: yup.object({
      newPassword: yup.string().required(),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('newPassword'), null], '')
        .required()
    }),
    onSubmit: async () => {
      if (formik.values.newPassword === formik.values.confirmPassword) {
        const loginVal = {
          userName: formik.values.username,
          oldPW: encryptePWD(formik.values.password),
          newPW: encryptePWD(formik.values.newPassword)
        }
        console.log(loginVal)

        try {
          const accessToken = loggedUser.accessToken
          if (!accessToken) {
            throw new Error('Failed to retrieve access token')
          }
          var bodyFormData = new FormData()
          bodyFormData.append('record', JSON.stringify(loginVal))

          const res = await axios({
            method: 'POST',
            url: `${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/changePW`,
            headers: {
              Authorization: 'Bearer ' + accessToken,
              'Content-Type': 'multipart/form-data'
            },
            data: bodyFormData
          }).then(res => {
            toast.success('Password changed successfully!')
            formik.setFieldValue('password', '')
            formik.setFieldValue('newPassword', '')
            formik.setFieldValue('confirmPassword', '')
          })
          if (reopenLogin === true) {
            window.close()
            onClose()
          }
        } catch (error) {
          stackError({ message: error.message })
        }
      } else {
        toast.error('Passwords do not match!')
      }
    }
  })

  const colors = ['#C11B17', '#FDD017', '#4AA02C', '#6AFB92', '#00FF00']

  const scorePassword = passwd => {
    let score = 0

    if (passwd.length < 5) {
      score += 3
    } else if (passwd.length > 4 && passwd.length < 8) {
      score += 6
    } else if (passwd.length > 7 && passwd.length < 16) {
      score += 12
    } else if (passwd.length > 15) {
      score += 18
    }

    if (passwd.match(/[a-z]/)) {
      score += 1
    }

    if (passwd.match(/[A-Z]/)) {
      score += 5
    }

    if (passwd.match(/\d+/)) {
      score += 5
    }

    if (passwd.match(/(.*[0-9].*[0-9].*[0-9])/)) {
      score += 5
    }

    if (passwd.match(/.[!,@,#,$,%,^,&,*,?,_,~]/)) {
      score += 5
    }

    if (passwd.match(/(.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~])/)) {
      score += 5
    }

    if (passwd.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      score += 2
    }

    if (passwd.match(/([a-zA-Z])/) && passwd.match(/([0-9])/)) {
      score += 2
    }

    if (passwd.match(/([a-zA-Z0-9].*[!,@,#,$,%,^,&,*,?,_,~])|([!,@,#,$,%,^,&,*,?,_,~].*[a-zA-Z0-9])/)) {
      score += 2
    }

    return score
  }

  const onPasswordChange = e => {
    const newPassword = e.target.value
    setPassword(newPassword)

    if (newPassword === '') {
      setScore(0)
      setColor('white')

      return
    }

    const newScore = scorePassword(newPassword)
    setScore(newScore)

    let i
    if (newScore < 16) {
      i = 0
    } else if (newScore > 15 && newScore < 25) {
      i = 1
    } else if (newScore > 24 && newScore < 35) {
      i = 2
    } else if (newScore > 34 && newScore < 45) {
      i = 3
    } else {
      i = 4
    }

    setColor(colors[i])
    formik.setFieldValue('newPassword', newPassword)
  }

  const onConfirmPasswordChange = e => {
    setConfirmPassword(e.target.value)
    formik.setFieldValue('confirmPassword', e.target.value)
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='password'
              size='small'
              fullWidth
              label={'_labels.password'}
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && formik.errors.password}
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
          <Grid item xs={12}>
            <CustomTextField
              name='newPassword'
              size='small'
              fullWidth
              label={'_labels.newPassword'}
              type={showNewPassword ? 'text' : 'password'}
              value={formik.values.newPassword}
              onChange={onPasswordChange}
              error={formik.touched.newPassword && formik.errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      onMouseDown={e => e.preventDefault()}
                    >
                      <Icon icon={showNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <LinearProgress
                variant='determinate'
                value={(score / 50) * 100}
                sx={{
                  flexGrow: 1,
                  height: 10,
                  backgroundColor: 'lightgrey',
                  '& .MuiLinearProgress-bar': { backgroundColor: color }
                }}
              />
            </Box>
            <CustomTextField
              name='confirmPassword'
              type={'password'}
              label={'_labels.confirmPassword'}
              required
              onChange={onConfirmPasswordChange}
              autoComplete='off'
              onClear={() => formik.setFieldValue('confirmPassword', '')}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            />
          </Grid>
          <Grid bottom={0} left={0} width='100%' position='fixed'>
            <Button
              onClick={formik.handleSubmit}
              variant='contained'
              sx={{
                mr: 1,
                backgroundColor: '#4eb558',
                '&:hover': {
                  backgroundColor: '#4eb558',
                  opacity: 0.8
                },
                width: '50px !important',
                height: '35px',
                objectFit: 'contain',
                minWidth: '30px !important'
              }}
            >
              <img src={'/images/buttonsIcons/save.png'} alt={'platformLabels.Submit'} />
            </Button>
          </Grid>
        </Grid>
      </Grow>
    </VertLayout>
  )
}

export default ChangePassword
