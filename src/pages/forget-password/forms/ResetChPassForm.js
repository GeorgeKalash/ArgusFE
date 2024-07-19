import React, { useContext, useState } from 'react'
import { Box, Button, Grid, IconButton, InputAdornment, LinearProgress } from '@mui/material'
import CustomTextField from '../Inputs/CustomTextField'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { useForm } from 'src/hooks/form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { AuthContext } from 'src/providers/AuthContext'
import { useAuth } from 'src/hooks/useAuth'
import { useError } from 'src/error'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ResetChangePass = ({ _labels, username = '' }) => {
  const [score, setScore] = useState(0)
  const { stack: stackError } = useError()
  const auth = useAuth()
  const { encryptePWD } = useContext(AuthContext)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      username: username ? username : auth?.user?.username,
      code: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: yup.object({
      password: yup.string().required(),
      confirmPassword: yup.string().required()
    }),
    onSubmit: async () => {
      if (formik.values.password === formik.values.confirmPassword) {
        const resetPWVal = {
          userName: formik.values.username,
          password: encryptePWD(formik.values.password)
        }

        try {
          const response = await postRequest({
            extension: SystemRepository.ResetPW.set,
            record: resetPWVal,
            url: `${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/`
          })

          toast.success('Password changed successfully!')
          router.push('/login')
          router.reload()
        } catch (error) {
          stackError({ message: error.message })
        }
      } else {
        toast.error('Passwords do not match!')
      }
    }
  })

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='code'
              size='small'
              fullWidth
              label={_labels.code}
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && formik.errors.code}
              /*  InputProps={{
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
              }} */
            />
          </Grid>
        </Grid>
        <NewPassword formik={formik} labels={_labels} score={score} setScore={setScore} />
      </Grow>
    </VertLayout>
  )
}

export default ResetChangePass
