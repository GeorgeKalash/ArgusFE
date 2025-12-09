import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const UserSecretOTPQrCodeForm = () => {
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

  const actions = [
    {
      key: 'generated 2 FA',
      condition: true,
      onClick: () => handleGenerated2FA(),
      disabled: false
    }
  ]

  return (
    <Form actions={actions} onSave={handleGenerated2FA} isSaved={false} fullSize>
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
      </VertLayout>
    </Form>
  )
}

export default UserSecretOTPQrCodeForm
