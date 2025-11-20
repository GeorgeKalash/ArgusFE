import React, { useContext, useState } from 'react'
import { Grid, IconButton, InputAdornment } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { AuthContext } from '@argus/shared-providers/AuthContext'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { useError } from '@argus/shared-domain/src/lib/error'
import NewPassword from '@argus/shared-ui/src/components/Shared/NewPassword'
import axios from 'axios'
import { useRouter } from 'next/router'

const ResetPassForm = ({ labels, username = '' }) => {
  const [score, setScore] = useState(0)
  const { stack: stackError } = useError()
  const auth = useAuth()
  const { encryptePWD } = useContext(AuthContext)
  const router = useRouter()

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      username: username ? username : auth?.user?.username,
      code: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: yup.object({
      newPassword: yup.string().required(),
      confirmPassword: yup.string().required()
    }),
    onSubmit: async () => {
      if (formik.values.newPassword === formik.values.confirmPassword) {
        const resetPWVal = {
          userName: formik.values.username,
          password: encryptePWD(formik.values.newPassword),
          code: formik.values.code
        }

        var bodyFormData = new FormData()
        bodyFormData.append('record', JSON.stringify(resetPWVal))

        axios
          .post(`${process.env.NEXT_PUBLIC_AuthURL}MA.asmx/resetPW`, bodyFormData)
          .then(res => {
            toast.success(labels.passSuccess)
            router.push('/login')
          })
          .catch(error => {
            stackError({ message: error })
          })
      } else {
        toast.error(labels.passNotMatching)
      }
    }
  })

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ px: '10px', pt: '10px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='code'
              size='small'
              fullWidth
              label={labels.code}
              value={formik.values.code}
              onChange={formik.handleChange}
              error={formik.touched.code && formik.errors.code}
              startIcons={[<img key='forgot-icon' src='/images/password/forgotPWD1.png' alt='icon' />]}
            />
          </Grid>
        </Grid>
        <NewPassword formik={formik} labels={labels} score={score} setScore={setScore} />
      </Grow>
    </VertLayout>
  )
}

export default ResetPassForm
