import React, { useState, useEffect, useContext } from 'react';
import Grid from '@mui/system/Unstable_Grid/Grid';
import Window from './Window';
import { RequestsContext } from 'src/providers/RequestsContext';

// ** Global css styles
import  styles from  '../../../styles/phoneVerification.module.css';
import { CTCLRepository } from 'src/repositories/CTCLRepository';


const OTPPhoneVerification = ({ formValidation, functionId, onClose , setShowOtpVerification, setEditMode, setErrorMessage}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)


  const [otp, setOtp] = useState(['', '', '', '', '','']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');

  // const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let interval;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setError('OTP expired. Please request a new one.');
    }

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(()=>{
    otpSMS();
  },[])

  const  otpSMS = () =>{

    var data = {clientId: formValidation.values.clientId, OTPRequest: {secret: null, functionId: functionId, deviceId: formValidation.values.cellPhone, otp: null } }
    postRequest({
      extension: CTCLRepository.OTPRepository.sms,
       record: JSON.stringify(data),
    })
      .then(res => {

        setError(res.error)

      })
      .catch(error => {
        setErrorMessage(error)
      })

  }

  const  checkSMS = (value) =>{

    var data = {clientId: formValidation.values.clientId, OTPRequest: {secret: null, functionId: functionId, deviceId: formValidation.values.cellPhone, otp: value } }
    postRequest({
      extension: CTCLRepository.OTPRepository.checkSms,
      record: JSON.stringify(data),

    })
      .then(res => {

        // console.log(res)

        // if (res.status === 303) {

        //   // Follow the redirection with a new GET request
        //  alert(res.error)
        // } else {
        //   formValidation.setFieldValue('OTPVerified', true )
        // }

        // formValidation.setFieldValue('OTPVerified', true )

        // setError(res.error)


      })
      .catch(error => {

        setErrorMessage(error)

      })
      formValidation.setFieldValue('OTPVerified', true )

      // setShowOtpVerification(false)
      console.log(formValidation)

      // setEditMode(true)

  }



  const handleOtpChange = (index, value) => {
    if (!isNaN(value) && value !== '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < otp.length - 1 && value !== '') {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleResendOtp = () => {
    // Implement logic to resend OTP to the user's phone number
    // You may want to set a cooldown to prevent frequent requests
    setTimer(60); // Reset the timer
    setError(''); // Clear any previous error
    setOtp(['', '', '', '', '','']); // Clear the entered OTP
    document.getElementById('otp-input-0').focus(); // Set focus to the first input field
    console.log('Resend OTP');
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');
console.log(enteredOtp)
checkSMS(enteredOtp)

    // Implement logic to send the entered OTP to the backend for verification
    // You can use a library like axios to make an API request

    // For this example, we'll just log the entered OTP
    console.log('Entered OTP:', enteredOtp);
  };

  return (
    <Window width={500} height={300} onClose={onClose}>
    <Grid className={styles.phoneVerificationContainer}>

      <h2>Verify My Account</h2>
      <Grid  className={styles.otpInputContainer}>
        {otp.map((digit, index) => (
          <input
          className={styles.inputText}
            key={index}
            type="text"
            id={`otp-input-${index}`}
            maxLength="1"
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
          />
        ))}
      </Grid>
      <Grid className={styles.timerContainer}>
        {timer > 0 ? (
          <p>Time remaining: {timer}s</p>
        ) : (
          <p className={styles.expiredTimer}>OTP expired</p>
        )}
      </Grid>
      <button  className={styles.resendButton} onClick={handleResendOtp} disabled={timer > 0}>
        Resend OTP
      </button>
      <button className={styles.verifyButton} onClick={handleVerifyOtp} disabled={timer === 0}>
        Verify OTP
      </button>
        {error && <p   className={styles.errorMessage} >{error}</p>}
    </Grid>
    </Window>
  );
};

export default OTPPhoneVerification;
