import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { useContext } from 'react'
import axios from 'axios'
import { Card, CardContent, Grid, Box } from '@mui/material'
import * as yup from 'yup'
import BlankLayout from '@argus/shared-core/src/@core/layouts/BlankLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useForm } from '@argus/shared-hooks/src/hooks/form.js'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import ResetPassForm from '../forms/ResetPassForm'
import styles from './Reset.module.css'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import inputs from '@argus/shared-ui/src/components/Inputs/Inputs.module.css'

const Reset = () => {
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const auth = useAuth()
  const { stack: stackError } = useError()

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: { username: '' },
    validationSchema: yup.object({ username: yup.string().required() }),
    onSubmit: values => {
      const bodyFormData = new FormData()
      bodyFormData.append('record', JSON.stringify(values))

      axios
        .post(`${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/generateCode`, bodyFormData)
        .then(res => {
          const mailCode = {
            userName: values.username,
            code: res.data.recordId,
            resetUrl: `https://${window.location.host}/reset.js?email=${encodeURIComponent(values.username)}&code=${
              res.data.recordId
            }`
          }

          const bodyFormData2 = new FormData()
          bodyFormData2.append('record', JSON.stringify(mailCode))

          axios
            .post(`${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/mailCode`, bodyFormData2, {
              headers: { AccountId: auth?.getAC?.data?.record?.accountId }
            })
            .then(() => openForm(values.username))
            .catch(error => stackError({ message: error.message || error }))
        })
        .catch(error => stackError({ message: error.message || error }))
    }
  })

  function openForm(username) {
    stack({
      Component: ResetPassForm,
      props: { labels: platformLabels, username },
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
    if (event.key === 'Enter') formik.handleSubmit()
  }

  return (
    <Box className={styles.contentCenter}>
      <Card className={styles.card}>
        <Box className={styles.cardHeader}>{platformLabels.resetPass}</Box>
        <CardContent className={styles.cardContent}>
          <VertLayout>
            <Grow>
              <Grid container spacing={2} pt={1.5}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='username'
                    size='small'
                    fullWidth
                    label={platformLabels.Username}
                    value={formik.values.username}
                    type='text'
                    onChange={formik.handleChange}
                    onKeyDown={handleKeyDown}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    placeholder={platformLabels.enterUserName}
                    InputLabelProps={{ shrink: true }}
                    startIcons={[
                      <div key='email-icon'>
                        <img
                          key='icon'
                          src={require('@argus/shared-ui/src/components/images/password/mail.png').default.src}
                          alt='mail icon'
                          class={inputs.iconImage}
                        />
                      </div>
                    ]}
                    onClear={() => formik.setFieldValue('username', '')}
                  />
                </Grid>
                <Grid item xs={12} container justifyContent='flex-end' className={styles.contentButton}>
                  <CustomButton label={platformLabels.Reset} onClick={formik.handleSubmit} color='#231f20' />
                </Grid>
              </Grid>
            </Grow>
          </VertLayout>
        </CardContent>
      </Card>
      <Box component='footer' className={styles.footer}>
        © {new Date().getFullYear()} Argus. All rights reserved. 3.1.8 API: 2.8.8
      </Box>
    </Box>
  )
}

Reset.getLayout = page => <BlankLayout>{page}</BlankLayout>
Reset.guestGuard = true

export default Reset
