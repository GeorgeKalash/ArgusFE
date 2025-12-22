import React, { useContext, useEffect, useState } from 'react'
import { Grid, IconButton, InputAdornment } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { useError } from '@argus/shared-providers/src/providers/error'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'
import NewPassword from './NewPassword'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { AccountRepository } from '@argus/repositories/src/repositories/AccountRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { getStorageData } from '@argus/shared-domain/src/storage/storage'
import inputs from '../Inputs/Inputs.module.css'

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
  const { platformLabels } = useContext(ControlContext)
  const { getIdentityRequest, postIdentityRequest } = useContext(RequestsContext)

  useSetWindow({ title: platformLabels.ChangePassword, window })

  const userData = getStorageData('userData')

  useEffect(() => {
    ;(async function () {
      if (reopenLogin == false) {
        const res = await getIdentityRequest({
          extension: AccountRepository.Identity.get,
          parameters: `_email=${userData?.username}`
        })
        formik.setFieldValue('passwordExpiryDays', res.record?.passwordExpiryDays)
      }
    })()
  }, [reopenLogin])

  const { formik } = useForm({
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

        let accessToken

        if (propLoggedUser && propLoggedUser.accessToken) {
          accessToken = propLoggedUser.accessToken
        } else {
          accessToken = await getAccessToken()
        }

        if (!accessToken) {
          throw new Error('Failed to retrieve access token')
        }

        await postIdentityRequest({
          extension: AccountRepository.changePW,
          accessToken: accessToken,
          record: JSON.stringify(loginVal)
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
      } else {
        toast.error(_labels.passNotMatching)
      }
    }
  })

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={2} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
          <Grid item xs={12}>
            <CustomNumberField
              name='passwordExpiryDays'
              label={_labels.passwordExpiryDays}
              value={formik.values?.passwordExpiryDays}
              readOnly
              hidden={reopenLogin}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='password'
              fullWidth
              label={_labels.password}
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && formik.errors.password}
              startIcons={ [ <div  className={inputs.iconButton}   >
              <img  className={inputs.iconImage} src= {require('@argus/shared-ui/src/components/images/password/forgotPWD1.png').default.src}/>
              </div>]}
              endIcons={ [ 
                <IconButton className={inputs.iconButton} 
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={e => e.preventDefault()}
              >
                <Icon  className={inputs.icon}  icon={showPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
              </IconButton>
              ]}  
            />
          </Grid>
        </Grid>
        <NewPassword formik={formik} labels={_labels} score={score} setScore={setScore} />
      </Grow>
    </VertLayout>
  )
}
ChangePassword.width = 600
ChangePassword.height = 400

export default ChangePassword
