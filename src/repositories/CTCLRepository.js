const service = 'CTCL.asmx/'

export const CTCLRepository = {


  CtClientIndividual: {
    snapshot : service + "snapshotCL",
    set2: service + 'set2CLR',

  },
  OTPRepository:{
    sms: service + "smsOTP",
    checkSms : service + "checkOTP"

  }

}
