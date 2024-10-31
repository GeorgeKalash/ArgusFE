import { Grid, Box } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
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
    <VertLayout>
      <Grid container spacing={4} justifyContent='center'>
        <Box mt={20}>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt={_labels.QRCode}
              style={{
                width: 200,
                height: 200
              }}
            />
          ) : (
            <div></div>
          )}
        </Box>
      </Grid>
      <Fixed>
        <Grid item xs={12} sx={{ marginTop: '30px' }}>
          <WindowToolbar actions={actions} smallBox={true} />
        </Grid>
      </Fixed>
    </VertLayout>
  )
}

export default UserSecretOTPQrCodeForm
