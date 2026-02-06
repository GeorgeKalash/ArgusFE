import React from 'react'
import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import UserSecretOTPQrCodeForm from './Forms/UserSecretOTPQrCodeForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const UserSecretOTPQrCode = () => {
  return <ImmediateWindow labelKey={'userOTPQrcode'} datasetId={ResourceIds.UserSecretOTPQrCode} Component={UserSecretOTPQrCodeForm} />
}

export default UserSecretOTPQrCode