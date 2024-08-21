import React, { useContext, useState } from 'react'
import { Grid, IconButton, InputAdornment } from '@mui/material'
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
import { AuthContext } from 'src/providers/AuthContext'
import NewPassword from './NewPassword'

const ChangePassword = ({
  _labels,
  reopenLogin = false,
  loggedUser: propLoggedUser,
  window,
  username = '',
  onClose
}) => {
  const [score, setScore] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const { stack: stackError } = useError()
  const auth = useAuth()
  const { encryptePWD, getAccessToken } = useContext(AuthContext)

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
      confirmPassword: yup.string().required()
    }),
    onSubmit: async () => {
      if (formik.values.newPassword === formik.values.confirmPassword) {
        const loginVal = {
          userName: formik.values.username,
          oldPW: encryptePWD(formik.values.password),
          newPW: encryptePWD(formik.values.newPassword)
        }

        try {
          const accessToken = propLoggedUser ? propLoggedUser.accessToken : await getAccessToken()

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
            toast.success(_labels.passSuccess)
            formik.setFieldValue('password', '')
            formik.setFieldValue('newPassword', '')
            formik.setFieldValue('confirmPassword', '')
            setScore(0)
          })
          if (reopenLogin === true) {
            window.close()
            onClose()
          }
        } catch (error) {
          stackError({ message: error.message })
        }
      } else {
        toast.error(_labels.passNotMatching)
      }
    }
  })

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='password'
              size='small'
              fullWidth
              label={_labels.password}
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && formik.errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <IconButton edge='start'>
                      <img src='/images/password/forgotPWD1.png' />
                    </IconButton>
                  </InputAdornment>
                ),
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
        <NewPassword formik={formik} labels={_labels} score={score} setScore={setScore} />
      </Grow>
    </VertLayout>
  )
}

export default ChangePassword
