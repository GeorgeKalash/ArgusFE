import React, { useState } from 'react'
import { Box, Button, DialogActions, Grid, IconButton, InputAdornment, LinearProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import CustomTextField from '../Inputs/CustomTextField'

const NewPassword = ({ formik, labels, score, setScore }) => {
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
    <Grid container spacing={3} sx={{ pl: '10px', pt: '10px', pr: '10px' }}>
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
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <IconButton edge='start'>
                  <div style={{ width: '20px', height: '20px' }}>
                    <img src='/images/password/forgotPWD3.png' style={{ width: '100%', height: '100%' }} />
                  </div>
                </IconButton>
              </InputAdornment>
            ),
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
          size='small'
          fullWidth
          label={labels.confirmPassword}
          type={showConfirmNewPassword ? 'text' : 'password'}
          value={formik.values.confirmPassword}
          onChange={onConfirmPasswordChange}
          error={formik.touched.confirmPassword && formik.errors.confirmPassword}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <IconButton edge='start'>
                  <div style={{ width: '20px', height: '20px' }}>
                    <img src='/images/password/forgotPWD3.png' style={{ width: '100%', height: '100%' }} />
                  </div>
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  edge='end'
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  onMouseDown={e => e.preventDefault()}
                >
                  <Icon icon={showConfirmNewPassword ? 'mdi:eye-outline' : 'mdi:eye-off-outline'} />
                </IconButton>
              </InputAdornment>
            )
          }}
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
      </DialogActions>
    </Grid>
  )
}

export default NewPassword
