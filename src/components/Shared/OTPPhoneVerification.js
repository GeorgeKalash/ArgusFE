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
  const [disabled, setDisabled] = useState(0);

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
    document.getElementById(`otp-input-${0}`).focus();
    otpSMS();
  },[])

  const  otpSMS = () =>{

    var data = {clientId: formValidation.values.clientId, secret: '', functionId: functionId, deviceId: formValidation.values.cellPhone, otp: null }
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
    if(value.length > 1){

    var data = {clientId: formValidation.values.clientId, secret: '', functionId: functionId, deviceId: formValidation.values.cellPhone, otp: value  }
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
      }else{
        setError('All Fields Required')
      }

  }



  const handleOtpChange = (index, e) => {



      document.getElementById(`otp-input-${index}`).select();

    const value = e.target.value
    const newOtp = [...otp];
    if (!isNaN(value) && value !== '') {

      newOtp[index] = value;
      setOtp(newOtp);

      if (index < otp.length - 1 && value !== '') {
        document.getElementById(`otp-input-${index + 1}`).focus();
        document.getElementById(`otp-input-${index + 1}`).select();
      }
    }else if( e.nativeEvent.inputType ==='deleteContentBackward'){
        newOtp[index] = '';
        setOtp(newOtp);

        // if(index > 0 && document.getElementById(`otp-input-${index - 1}`).value ===''  ){
        //   document.getElementById(`otp-input-${index}`).focus();
        //   document.getElementById(`otp-input-${index}`).select();
        // }
        if(index > 0 && document.getElementById(`otp-input-${index - 1}`).value !==''  ){
          document.getElementById(`otp-input-${index}`).focus();

          // document.getElementById(`otp-input-${index}`).select();
        }

    }else if(value !== '' && document.getElementById(`otp-input-${index}`).value !==''){
      document.getElementById(`otp-input-${index}`).select();
      newOtp[index] = value;
      setOtp(newOtp);

  }
  };

  useEffect(()=>{

checkDisable()
  },[otp])

function checkDisable(){
  setDisabled(0)
  var count = 0;
   otp.map((digit, index) => (
    digit !==''  &&  count++
   ))
   if(count > 5){
    setDisabled(count)

   }

}

  const handleKeyUp = (index , e) => {
    const currentValue = e.target.value;

    if (e.key == 'ArrowRight' && index <6) {
      document.getElementById(`otp-input-${index + 1 }`)?.focus();
      document.getElementById(`otp-input-${index + 1 }`)?.select();

    }else if (e.key == 'ArrowLeft' && index > 0) {
        document.getElementById(`otp-input-${index -1 }`)?.focus();
        document.getElementById(`otp-input-${index -1 }`)?.select();
    }else if (currentValue === document.getElementById(`otp-input-${index}`).value ) {
      document.getElementById(`otp-input-${index}`)?.select();


    }
  };

  const handleResendOtp = () => {
    // Implement logic to resend OTP to the user's phone number
    // You may want to set a cool down to prevent frequent requests
    setTimer(60); // Reset the timer
    setError(''); // Clear any previous error
    setOtp(['', '', '', '', '','']); // Clear the entered OTP
    document.getElementById('otp-input-0').focus(); // Set focus to the first input field
    console.log('Resend OTP');
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join('');

checkSMS(enteredOtp)

    // Implement logic to send the entered OTP to the backend for verification
    // You can use a library like axios to make an API request

    // For this example, we'll just log the entered OTP
    console.log('Entered OTP:', enteredOtp);
  };

  return (
    <div width={500} height={300} onClose={onClose}>
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
            onKeyUp={(e) => handleKeyUp(index, e)}
            value={digit}
            onChange={(e) => handleOtpChange(index, e)}
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
      <button className={styles.verifyButton} onClick={handleVerifyOtp} disabled={(timer === 0 || disabled < 5 ) ? true : false}>
        Verify OTP
      </button>
        {error && <p   className={styles.errorMessage} >{error}</p>}
    </Grid>
    </div>
  );
};

export default OTPPhoneVerification;
