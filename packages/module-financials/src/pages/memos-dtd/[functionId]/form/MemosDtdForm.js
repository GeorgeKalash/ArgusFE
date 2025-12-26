import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'

import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function MemosDtdForm({ labels, maxAccess, recordId, functionId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FIDocTypeDefaults.qry
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      plantId: '',
      recordId: recordId || ''
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.string().required(' ')
    }),
    onSubmit: async obj => {
      const recordId = obj.recordId
      await postRequest({
        extension: FinancialRepository.FIDocTypeDefaults.set,
        record: JSON.stringify(obj)
      })
      if (!recordId) {
        formik.setFieldValue('recordId', obj.dtId)
      }

      toast.success(platformLabels.Submit)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      try {
        if (recordId) {
          const res = await getRequest({
            extension: FinancialRepository.FIDocTypeDefaults.get,
            parameters: `_dtId=${recordId}`
          })

          formik.setValues({ ...res.record, recordId: recordId })
        }
      } catch (exception) {}
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FIDocTypeDefaults} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${functionId}`}
                name='dtId'
                required
                label={labels.doctype}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  const plantId = newValue?.recordId || ''
                  formik.setFieldValue('plantId', plantId)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
