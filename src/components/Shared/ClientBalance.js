import React, { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { Grid } from '@mui/material'
import CustomNumberField from '../Inputs/CustomNumberField'
import { useForm } from 'src/hooks/form'
import useResourceParams from 'src/hooks/useResourceParams'
import FormShell from './FormShell'

export const ClientBalance = ({ recordId }) => {
  const { getRequest } = useContext(RequestsContext)

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.ClientBalance
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId,
      owYTD: '',
      owMTD: '',
      iwYTD: '',
      iwMTD: ''
    },
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true
  })


  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: RTCLRepository.ClientBalance.get,
            parameters: `_clientId=${recordId}`
          })

          formik.setValues(res.record)
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell 
        resourceId={ResourceIds.ClientBalance} 
        form={formik} 
        maxAccess={access} 
        isSavedClear={false}
        isCleared={false}
        isSaved={false}
        isInfo={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomNumberField
                name='owYTD'
                label={_labels.owYTD}
                value={formik?.values?.owYTD}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='owMTD'
                label={_labels.owMTD}
                value={formik?.values?.owMTD}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='iwYTD'
                label={_labels.iwYTD}
                value={formik?.values?.iwYTD}
                maxAccess={access}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='iwMTD'
                label={_labels.iwMTD}
                value={formik?.values?.iwMTD}
                maxAccess={access}
                readOnly
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
