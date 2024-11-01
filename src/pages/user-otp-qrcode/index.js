import React from 'react'
import { ImmediateWindow } from 'src/windows'
import UserSecretOTPQrCodeForm from './Forms/UserSecretOTPQrCodeForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const UserSecretOTPQrCode = () => {
  return <ImmediateWindow labelKey={'userOTPQrcode'} datasetId={ResourceIds.UserSecretOTPQrCode} Component={UserSecretOTPQrCodeForm} />
}

export default UserSecretOTPQrCode