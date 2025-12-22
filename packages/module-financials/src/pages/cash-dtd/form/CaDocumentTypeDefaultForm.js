import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CashBankRepository } from '@argus/repositories/src/repositories/CashBankRepository'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

export default function CaDocumentTypeDefaultForm({ labels, maxAccess, recordId }) {
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.DocumentTypeDefault.page
  })

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      plantId: '',
      recordId: recordId || null,
      cashAccountId: '',
      fromCashAccountId: '',
      toCashAccountId: ''
    },
    maxAccess,
    validationSchema: yup.object({
      dtId: yup.string().required(),
      fromCashAccountId: yup.string().nullable(),
      toCashAccountId: yup
        .string()
        .nullable()
        .test(function (value) {
          const { fromCashAccountId } = this.parent
          if (!value || !fromCashAccountId) return true

          return value !== fromCashAccountId
        })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: CashBankRepository.DocumentTypeDefault.set,
        record: JSON.stringify(obj)
      })

      !obj.recordId && formik.setFieldValue('recordId', formik.values.dtId)
      toast.success(!obj.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.DocumentTypeDefault.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          recordId: recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.CaDtd} form={formik} maxAccess={maxAccess} editMode={editMode} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.DocumentType.qry}
                parameters={`_startAt=0&_pageSize=1000&_dgId=${SystemFunction.CashTransfer}`}
                name='dtId'
                required
                label={labels.documentType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={editMode}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('dtId', newValue?.recordId || '')
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={platformLabels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='fromCashAccountId'
                label={labels.fromCa}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('fromCashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.fromCashAccountId && Boolean(formik.errors.fromCashAccountId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CashBankRepository.CashAccount.qry}
                parameters={`_type=0`}
                name='toCashAccountId'
                label={labels.toCa}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('toCashAccountId', newValue?.recordId || null)
                }}
                error={formik.touched.toCashAccountId && Boolean(formik.errors.toCashAccountId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
