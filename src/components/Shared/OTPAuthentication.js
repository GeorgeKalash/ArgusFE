import React, { useState, useEffect, useContext } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import styles from '../../../styles/phoneVerification.module.css'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from 'src/hooks/useAuth'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { RequestsContext } from 'src/providers/RequestsContext'

const OTPAuthentication = ({ loggedUser, onClose, window, PlantSupervisors = false, values }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [disabled, setDisabled] = useState(0)
  const { apiUrl, languageId } = useAuth()
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)

  const errorModel = useError()

  async function showError(props) {
    if (errorModel) await errorModel.stack(props)
  }

  const checkSMS = value => {
    if (value.length > 1) {
      const throwError = false

      var data = {
        otp: value
      }
      const accessToken = loggedUser.accessToken
      var bodyFormData = new FormData()
      bodyFormData.append('record', JSON.stringify(data))

      axios({
        method: 'POST',
        url: apiUrl + AccessControlRepository.checkOTP,
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'multipart/form-data',
          LanguageId: languageId
        },
        data: bodyFormData
      })
        .then(res => {
          toast.success(platformLabels.verificationCompleted)
          window.close()
          onClose()
        })
        .catch(error => {
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
        })
    } else {
      setError(platformLabels.AllFieldsRequired)
    }
  }

  const checkPlantSupervisors = async value => {
    if (value.length > 1) {
      var data = {
        plantId: values.plantId,
        otp: value
      }
      await postRequest({
        extension: AccessControlRepository.PlantSupervisors.verify,
        record: JSON.stringify(data)
      }).then(res => {
        toast.success(platformLabels.verificationCompleted)
        window.close()
        onClose()
      })
    } else {
      setError(platformLabels.AllFieldsRequired)
    }
  }

  const handleOtpChange = (index, e) => {
    document.getElementById(`otp-input-${index}`).select()

    const value = e.target.value
    const newOtp = [...otp]
    if (!isNaN(value) && value !== '') {
      newOtp[index] = value
      setOtp(newOtp)

      if (index < otp.length - 1 && value !== '') {
        document.getElementById(`otp-input-${index + 1}`).focus()
        document.getElementById(`otp-input-${index + 1}`).select()
      } else if (index === otp.length - 1) {
        const isOtpComplete = newOtp.every(digit => digit !== '')
        if (isOtpComplete) {
          handleVerifyOtp(newOtp)
        }
      }
    } else if (e.nativeEvent.inputType === 'deleteContentBackward') {
      newOtp[index] = ''
      setOtp(newOtp)
      if (index > 0 && document.getElementById(`otp-input-${index - 1}`).value !== '') {
        document.getElementById(`otp-input-${index}`).focus()
      }
    } else if (value !== '' && document.getElementById(`otp-input-${index}`).value !== '') {
      document.getElementById(`otp-input-${index}`).select()
      newOtp[index] = value
      setOtp(newOtp)
    }
  }

  useEffect(() => {
    checkDisable()
  }, [otp])

  function checkDisable() {
    setDisabled(0)
    var count = 0
    otp.map((digit, index) => digit !== '' && count++)
    if (count > 5) {
      setDisabled(count)
    }
  }

  const handleKeyUp = (index, e) => {
    const currentValue = e.target.value

    if (e.key == 'ArrowRight' && index < 6) {
      document.getElementById(`otp-input-${index + 1}`)?.focus()
      document.getElementById(`otp-input-${index + 1}`)?.select()
    } else if (e.key == 'ArrowLeft' && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus()
      document.getElementById(`otp-input-${index - 1}`)?.select()
    } else if (currentValue === document.getElementById(`otp-input-${index}`).value) {
      document.getElementById(`otp-input-${index}`)?.select()
    }
  }

  const handleVerifyOtp = newOtp => {
    const enteredOtp = newOtp ? newOtp.join('') : otp.join('')
    PlantSupervisors ? checkPlantSupervisors(enteredOtp) : checkSMS(enteredOtp)
  }

  useEffect(() => {
    document.getElementById(`otp-input-${0}`).focus()
    document.getElementById(`otp-input-${0}`).select()
  }, [])

  return (
    <div width={500} height={300} onClose={onClose}>
      <Grid className={styles.phoneVerificationContainer}>
        <p>{platformLabels.TwoFactorAuthentication}</p>
        <Grid className={styles.otpInputContainer}>
          {otp.map((digit, index) => (
            <input
              className={styles.inputText}
              key={index}
              type='text'
              id={`otp-input-${index}`}
              maxLength='1'
              onKeyUp={e => handleKeyUp(index, e)}
              value={digit}
              onChange={e => handleOtpChange(index, e)}
            />
          ))}
        </Grid>
        <button className={styles.verifyButton} onClick={handleVerifyOtp} disabled={disabled < 5 ? true : false}>
          {platformLabels.verifyOTP}
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </Grid>
    </div>
  )
}

export default OTPAuthentication
