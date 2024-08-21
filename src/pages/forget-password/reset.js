import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState, useEffect, useContext } from 'react'
import axios from 'axios'

import { Card, CardContent, Button, Grid, Box, IconButton, InputAdornment } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import * as yup from 'yup'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { ControlContext } from 'src/providers/ControlContext'
import ResetPassForm from './forms/ResetPassForm'
import { useWindow } from 'src/windows'
import { useAuth } from 'src/hooks/useAuth'
import { useError } from 'src/error'
import { useForm } from 'src/hooks/form.js'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const Reset = () => {
  const theme = useTheme()
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const auth = useAuth()
  const { stack: stackError } = useError()

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      username: ''
    },
    validationSchema: yup.object({
      username: yup.string().required()
    }),
    onSubmit: values => {
      var bodyFormData = new FormData()
      bodyFormData.append('record', JSON.stringify(values))

      axios
        .post(`${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/generateCode`, bodyFormData)
        .then(res => {
          const mailCode = {
            userName: values.username,
            code: res.data.recordId,
            resetUrl: `https://${window.location.host}/reset.js?email=${values.username.replace('@', '%40')}&code=${
              res.data.recordId
            }` //link needs later review
          }
          var bodyFormData2 = new FormData()
          bodyFormData2.append('record', JSON.stringify(mailCode))
          axios
            .post(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/mailCode`, bodyFormData2, {
              headers: {
                AccountId: auth?.getAC?.data?.record?.accountId
              }
            })
            .then(openForm(values?.username))
            .catch(error => {
              stackError({ message: error })
            })
        })
        .catch(error => {
          stackError({ message: error })
        })
    }
  })

  function openForm(username) {
    stack({
      Component: ResetPassForm,
      props: {
        labels: platformLabels,
        username
      },
      expandable: false,
      closable: false,
      draggable: false,
      width: 600,
      height: 400,
      spacing: false,
      title: platformLabels.resetPass
    })
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      formik.handleSubmit()
    }
  }

  return (
    <VertLayout>
      <Grow>
        <Grid className='content-center' sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Card sx={{ zIndex: 0, width: '28rem', marginBottom: 10, marginTop: 'auto' }}>
            <Grid
              item
              style={{
                color: 'white',
                fontSize: '1.2rem',
                height: '50px',
                backgroundColor: theme.palette.primary.main,
                padding: '16px',
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center'
              }}
            >
              {platformLabels.resetPass}
            </Grid>
            <CardContent sx={{ p: theme => `${theme.spacing(8, 9, 0)} !important` }} onKeyDown={handleKeyDown}>
              <Grid container spacing={5}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='username'
                    size='small'
                    fullWidth
                    label={platformLabels.Username}
                    value={formik.values.username}
                    type='text'
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    placeholder={platformLabels.enterUserName}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <IconButton edge='start'>
                            <img src='/images/password/mail.png' />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} container justifyContent='flex-end'>
                  <Button size='small' type='submit' variant='contained' sx={{ mb: 7 }} onClick={formik.handleSubmit}>
                    {platformLabels.Reset}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box component='footer' sx={{ mt: 'auto' }}>
            © {new Date().getFullYear()} Argus. All rights reserved. 3.1.8 API: 2.8.8
          </Box>
        </Grid>
      </Grow>
    </VertLayout>
  )
}
Reset.getLayout = page => <BlankLayout>{page}</BlankLayout>
Reset.guestGuard = true

export default Reset
