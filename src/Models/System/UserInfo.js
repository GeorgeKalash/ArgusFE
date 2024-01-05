const getNewUserInfo = () => {
    return {
        recordId: null,
        fullName: null,
        username: null,
        umcpnl: false,
        email: null,
        cellPhone: null,
        activeStatus: null,
        isAdmin: null,
        notificationGroupId: null,
        languageId: null,
        languageName: null,
        password: null,
        accountId: null,
        enableHijriCalendar: null,
        companyName: null,
        activeStatusName: null,
        userType: null,
        userTypeString: null,
        branchName: null,
        departmentName: null,
        positionName: null,
        userTypeName: null,
        employeeId: null,
        employeeRef: null,
        employeeName: null,
        accessToken: null,
        refreshToken: null,
        homePage: null,
        menuTheme: null,
        confirmPassword: null
    }
  }
  
  const populateUserInfo = obj => {
    return {
        recordId: obj.recordId,
        fullName: obj.fullName,
        username: obj.username,
        umcpnl: obj.umcpnl,

         //umcpnl: obj.umcpnl !== null ? obj.umcpnl : false,
        email: obj.email,
        cellPhone: obj.cellPhone,
        activeStatus: obj.activeStatus,
        isAdmin: obj.isAdmin,
        notificationGroupId: obj.notificationGroupId,
        languageId: obj.languageId,
        languageName: obj.languageName,
        password: obj.password,
        accountId: obj.accountId,
        enableHijriCalendar: obj.enableHijriCalendar,
        companyName: obj.companyName,
        activeStatusName: obj.activeStatusName,
        userType: obj.userType,
        userTypeString: obj.userTypeString,
        branchName: obj.branchName,
        departmentName: obj.departmentName,
        positionName: obj.positionName,
        userTypeName: obj.userTypeName,
        employeeId: obj.employeeId,
        employeeRef: obj.employeeRef,
        employeeName: obj.employeeName,
        accessToken: obj.accessToken,
        refreshToken: obj.refreshToken,
        homePage: obj.homePage,
        menuTheme: obj.menuTheme,
        confirmPassword: obj.confirmPassword
    }
  }
  
  export { getNewUserInfo , populateUserInfo }
  