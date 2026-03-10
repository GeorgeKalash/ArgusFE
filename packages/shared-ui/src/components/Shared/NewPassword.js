import React, { useContext, useState } from 'react'
import { Box, DialogActions, Grid, IconButton, LinearProgress } from '@mui/material'
import Icon from '@argus/shared-core/src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import inputs from '../Inputs/Inputs.module.css'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'

const NewPassword = ({ formik, labels, score, setScore }) => {
    const { platformLabels } = useContext(ControlContext)
  const [color, setColor] = useState('white')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

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
    if (e.target.value === '') {
      setScore(0)
    }

    const newScore = scorePassword(e.target.value)
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
    formik.setFieldValue('newPassword', e.target.value)
  }

  const onConfirmPasswordChange = e => {
    formik.setFieldValue('confirmPassword', e.target.value)
  }

  return (
    <Grid container spacing={2} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
      <Grid item xs={12}>
        <CustomTextField
          name='newPassword'
          size='small'
          fullWidth
          label={labels.newPassword}
          type={showNewPassword ? 'text' : 'password'}
          value={formik.values.newPassword}
          onChange={onPasswordChange}
          error={formik.touched.newPassword && formik.errors.newPassword}
          startIcons={[
            <div key='lock-icon'  >
              <img   className={inputs.iconImage}  src={require('@argus/shared-ui/src/components/images/password/forgotPWD3.png').default.src} style={{ width: '100%', height: '100%' }} />
            </div>
          ]}
          endIcons={[
            <IconButton className={inputs.iconButton} 
              key='toggle-new-password'
              onClick={() => setShowNewPassword(!showNewPassword)}
              onMouseDown={e => e.preventDefault()}
            >
              <Icon className={inputs.icon} icon={showNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
            </IconButton>
          ]}
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
          size='small'
          fullWidth
          label={labels.confirmPassword}
          type={showConfirmNewPassword ? 'text' : 'password'}
          value={formik.values.confirmPassword}
          onChange={onConfirmPasswordChange}
          error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          startIcons={[
            <div  key='lock-icon-confirm' >
              <img  className={inputs.iconImage}  src={require('@argus/shared-ui/src/components/images/password/forgotPWD3.png').default.src} />
            </div>
          ]}
          endIcons={[
            <IconButton className={inputs.iconButton} 
              key='toggle-confirm-password'
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              onMouseDown={e => e.preventDefault()}
            >
              <Icon  className={inputs.icon}  icon={showConfirmNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
            </IconButton>
          ]}
        />
      </Grid>
      <DialogActions>
        <Grid
          container
          justifyContent='flex-end'
          bottom={0}
          left={0}
          width='100%'
          position='fixed'
          sx={{ padding: '8px !important' }}
        >
          <CustomButton
            image='save.png'
            tooltipText={platformLabels.Submit}
            onClick={formik.handleSubmit}
            style={{
              marginRight: 1,
              backgroundColor: '#4eb558',
              width: 50,
              height: 35,
              minWidth: 30,
              padding: 0
            }}
          />
        </Grid>
      </DialogActions>
    </Grid>
  )
}

export default NewPassword
