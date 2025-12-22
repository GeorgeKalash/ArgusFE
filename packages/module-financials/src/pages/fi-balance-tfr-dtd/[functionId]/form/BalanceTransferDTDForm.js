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
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'

export default function BalanceTransferDTDForm({ labels, maxAccess, recordId, functionId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, userDefaultsData } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: FinancialRepository.FIDocTypeDefaults.page
  })

  const spId = parseInt(userDefaultsData?.list?.find(obj => obj.key === 'spId')?.value)

  const { formik } = useForm({
    initialValues: {
      dtId: '',
      plantId: '',
      spId,
      crossAccountBalanceTransfer: false,
      recordId
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      dtId: yup.string().required()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: FinancialRepository.FIDocTypeDefaults.set,
        record: JSON.stringify(obj)
      })
      if (!obj.recordId) {
        formik.setFieldValue('recordId', obj.dtId)
      }

      toast.success(!obj.dtId ? platformLabels.Added : platformLabels.Edited)

      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialRepository.FIDocTypeDefaults.get,
          parameters: `_dtId=${recordId}`
        })

        formik.setValues({ ...res.record, recordId: recordId })
      }
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
                readOnly={editMode}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('dtId', newValue?.recordId || null)
                }}
                error={formik.touched.dtId && Boolean(formik.errors.dtId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='crossAccountBalanceTransfer'
                value={formik.values?.crossAccountBalanceTransfer}
                onChange={event => formik.setFieldValue('crossAccountBalanceTransfer', event.target.checked)}
                label={labels.crossAccountBalanceTransfer}
                maxAccess={maxAccess}
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
                onChange={(_, newValue) => {
                  formik.setFieldValue('plantId', newValue?.recordId || null)
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SaleRepository.SalesPerson.qry}
                name='spId'
                label={labels.salesPerson}
                valueField='recordId'
                columnsInDropDown={[
                  { key: 'spRef', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                displayField={['spRef', 'name']}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('spId', newValue?.recordId || null)
                }}
                maxAccess={maxAccess}
                error={formik?.touched?.spId && Boolean(formik?.errors?.spId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
