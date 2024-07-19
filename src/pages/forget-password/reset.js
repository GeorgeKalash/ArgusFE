import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState, useEffect, useContext } from 'react'
import axios from 'axios'

import { Card, CardContent, Button, Grid, Box, CardMedia } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useFormik } from 'formik'
import * as yup from 'yup'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import { ControlContext } from 'src/providers/ControlContext'
import ResetChPassForm from '../forms/ResetChPassForm'

const Reset = () => {
  const theme = useTheme()
  const { platformLabels } = useContext(ControlContext)
  const [accountId, setAccountId] = useState({})
  const { stack } = useWindow()

  useEffect(() => {
    const fetchData = async () => {
      const matchHostname = window.location.hostname.match(/^(.+)\.softmachine\.co$/)

      const accountName = matchHostname ? matchHostname[1] : 'byc-deploy'

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/getAC?_accountName=${accountName}`)

        setAccountId(response.data.record.accountId)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const validation = useFormik({
    enableReinitialize: true,
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
            resetUrl: `https://${window.location.host}/ForgotPassword.aspx?email=${values.username.replace(
              '@',
              '%40'
            )}&code=${res.data.recordId}`
          }
          var bodyFormData2 = new FormData()
          bodyFormData2.append('record', JSON.stringify(mailCode))
          axios
            .post(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/mailCode`, bodyFormData2, {
              headers: {
                AccountId: accountId
              }
            })
            .catch(error => {})
        })
        .catch(error => {})

      openForm(obj?.username)
    }
  })

  function openForm(recordId) {
    stack({
      Component: ResetChPassForm,
      props: {
        labels: _labels,
        username: formik.values.username
      },
      width: 500,
      height: 360,
      title: _labels.Activity
    })
  }

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      validation.handleSubmit()
    }
  }

  return (
    Boolean(Object.keys(platformLabels)?.length) && (
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
                    name='username'
                    size='small'
                    fullWidth
                    label={platformLabels.Username}
                    value={validation.values.username}
                    type='text'
                    onChange={validation.handleChange}
                    error={validation.touched.username && Boolean(validation.errors.username)}
                    helperText={validation.touched.username && validation.errors.username}
                    placeholder={platformLabels.enterId}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} container justifyContent='flex-end'>
                  <Button
                    size='small'
                    type='submit'
                    variant='contained'
                    sx={{ mb: 7 }}
                    onClick={validation.handleSubmit}
                  >
                    {platformLabels.Reset}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Footer Section */}
          <Box component='footer' sx={{ mt: 'auto' }}>
            © {new Date().getFullYear()} Argus. All rights reserved. 3.1.8 API: 2.8.8
          </Box>
        </Box>
      </>
    )
  )
}
Reset.getLayout = page => <BlankLayout>{page}</BlankLayout>
Reset.guestGuard = true

export default Reset
