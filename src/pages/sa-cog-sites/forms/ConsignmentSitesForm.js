import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

import { ControlContext } from 'src/providers/ControlContext'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function ConsignmentSitesForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: SaleRepository.ConsignmentSites.qry
  })

  const { formik } = useForm({
    initialValues: {
      recordId: recordId || null,
      clientId: '',
      siteId: '',
      clientRef: ''
    },
    maxAccess,
    enableReinitialize: false,
    validationSchema: yup.object({
      clientRef: yup.string().required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: SaleRepository.ConsignmentSites.set,
        record: JSON.stringify(obj)
      })

      if (!formik.values.recordId) {
        formik.setFieldValue('recordId', formik.values.clientId)

        toast.success(platformLabels.Added)
      } else toast.success(platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: SaleRepository.ConsignmentSites.get,
          parameters: `_clientId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: res.record.clientId })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ConsignmentSites} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SaleRepository.Client.snapshot}
                parameters={`_startAt=0&_pageSize=50&_filter=`}
                valueField='reference'
                displayField='name'
                name='clientRef'
                label={labels.client}
                form={formik}
                required
                readOnly={editMode}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                displayFieldWidth={2}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' }
                ]}
                onChange={(event, newValue) => {
                  formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('clientName', newValue ? newValue.name : '')
                  formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                }}
                error={formik.touched.clientRef && Boolean(formik.errors.clientRef)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                name='siteId'
                endpointId={InventoryRepository.Site.qry}
                parameters='_filter='
                label={labels.site}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('siteId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.siteId && Boolean(formik.errors.siteId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
