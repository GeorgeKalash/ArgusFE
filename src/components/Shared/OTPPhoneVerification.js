import React, { useState, useEffect, useContext } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { RequestsContext } from 'src/providers/RequestsContext'
import styles from '../../../styles/phoneVerification.module.css'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import toast from 'react-hot-toast'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'

const OTPPhoneVerification = ({
  formValidation,
  recordId,
  clientId,
  functionId,
  onClose,
  getData,
  onSuccess,
  window
}) => {
  const { postRequest } = useContext(RequestsContext)

  const { labels: labels, access } = useResourceParams({
    datasetId: ResourceIds.OTPVerify
  })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timer, setTimer] = useState(30)
  const [error, setError] = useState('')
  const [disabled, setDisabled] = useState(0)
  console.log(clientId, 'clientId')
  useEffect(() => {
    let interval

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1)
      }, 1000)
    } else {
      clearInterval(interval)
      setError('OTP expired. Please request a new one.')
    }

    return () => clearInterval(interval)
  }, [timer])

  useEffect(() => {
    document.getElementById(`otp-input-${0}`).focus()
    otpSMS()
  }, [])

  const otpSMS = () => {
    var data = {
      clientId: formValidation.values.clientId || clientId,
      secret: '',
      functionId: functionId,
      deviceId: formValidation.values.cellPhone,
      otp: null
    }
    postRequest({
      extension: CTCLRepository.OTPRepository.sms,
      record: JSON.stringify(data)
    })
      .then(res => {
        setError(res.error)
      })
      .catch(error => {})
  }

  const checkSMS = value => {
    if (value.length > 1) {
      var data = {
        clientId: formValidation.values.clientId || clientId,
        recordId: recordId || null,
        secret: '',
        functionId: functionId,
        deviceId: formValidation.values.cellPhone,
        otp: value
      }
      postRequest({
        extension: CTCLRepository.OTPRepository.checkSms,
        record: JSON.stringify(data)
      })
        .then(res => {
          toast.success('Verification Completed')
          if (onSuccess) onSuccess()
          if (getData) getData(formValidation?.values?.clientId)
          window.close()
        })
        .catch(error => {})
    } else {
      setError('All Fields Required')
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

  const handleResendOtp = () => {
    setTimer(30)
    setError('')
    setOtp(['', '', '', '', '', ''])
    document.getElementById('otp-input-0').focus()
    otpSMS()
  }

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('')
    checkSMS(enteredOtp)
  }

  return (
    <div width={500} height={300} onClose={onClose}>
      <Grid className={styles.phoneVerificationContainer}>
        <h2>{labels.OTPVerification}</h2>
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
        <Grid className={styles.timerContainer}>
          {timer > 0 ? (
            <p>
              {labels.timeRemaining}: {timer}s
            </p>
          ) : (
            <p className={styles.expiredTimer}>{labels.OTPExpired}</p>
          )}
        </Grid>
        <button className={styles.resendButton} onClick={handleResendOtp} disabled={timer > 0}>
          {labels.resendOTP}
        </button>
        <button
          className={styles.verifyButton}
          onClick={handleVerifyOtp}
          disabled={timer === 0 || disabled < 5 ? true : false}
        >
          {labels.verifyOTP}
        </button>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </Grid>
    </div>
  )
}

export default OTPPhoneVerification
