import React, { forwardRef, useContext, useEffect, useImperativeHandle, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const UserSecretOTPQrCodeForm = forwardRef((_, ref) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const { getRequest, postRequest } = useContext(RequestsContext)
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId
  const { platformLabels } = useContext(ControlContext)

  const fetchQrCode = async () => {
    const qrResponse = await getRequest({
      extension: AccessControlRepository.UserOTPQrcode.secret
    })
    setQrCodeUrl(qrResponse?.record?.imageUrl)
  }

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.UserSecretOTPQrCode
  })

  useEffect(() => {
    fetchQrCode()
  }, [])

  const handleGenerated2FA = async () => {
    const getUserResponse = await getRequest({
      extension: SystemRepository.Users.get,
      parameters: `_recordId=${userId}`
    })

    const updatedUserData = {
      ...getUserResponse.record,
      is2FAEnabled: true,
      otpDevice: 1,
      statusId: getUserResponse.statusId,
      message: getUserResponse.message
    }

    await postRequest({
      extension: SystemRepository.Users.set,
      record: JSON.stringify(updatedUserData)
    })

    toast.success(platformLabels.Enabled)
  }

  useImperativeHandle(ref, () => ({
    submit: handleGenerated2FA
  }))

  const actions = [
    {
      key: 'generated 2 FA',
      condition: true,
      onClick: () => handleGenerated2FA(),
      disabled: false
    }
  ]

  return (
    <VertLayout>
      <Grow>
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={_labels.QRCode}
            style={{
              width: 200,
              height: 200,
              margin: 'auto'
            }}
          />
        ) : (
          <div></div>
        )}
      </Grow>
      <Fixed>
        <WindowToolbar actions={actions} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
})

export default UserSecretOTPQrCodeForm
