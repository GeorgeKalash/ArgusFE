import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { PayrollRepository } from 'src/repositories/PayrollRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function TimeCodesForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: PayrollRepository.TimeCodes.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      edId: null,
      gracePeriod: null,
      timeCode: null,
      edType: null
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      gracePeriod: yup.number().min(0).max(9999)
    }),
    onSubmit: async obj => {
      const { recordId, ...rest } = obj
      await postRequest({
        extension: PayrollRepository.TimeCodes.set,
        record: JSON.stringify(rest)
      })

      toast.success(platformLabels.Edited)
      window.close()
      invalidate()
    }
  })
  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const { record } = await getRequest({
          extension: PayrollRepository.TimeCodes.get,
          parameters: `_timeCode=${recordId}`
        })
        formik.setValues({
          edId: record?.edId,
          gracePeriod: record?.gracePeriod || null,
          edType: record?.edType,
          timeCode: recordId,
          recordId
        })
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.TimeCodes}
      form={formik}
      maxAccess={maxAccess}
      isCleared={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.ENTITLEMENT_DEDUCTION_TYPE}
                name='edType'
                label={labels.type}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('edType', newValue?.key || null)
                  formik.setFieldValue('edId', null)
                }}
                error={formik.touched.edType && Boolean(formik.errors.edType)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TIME_CODE}
                name='recordId'
                readOnly
                label={labels.timeVariationType}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('recordId', newValue?.key || null)
                }}
                error={formik.touched.recordId && Boolean(formik.errors.recordId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.EmployeeDeduction.qry}
                parameters={`_filter=&_size=30&_startAt=0`}
                filter={item => item.type == formik.values.edType}
                name='edId'
                label={labels.entDed}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField={['reference', 'name']}
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('edId', newValue?.recordId || null)
                }}
                error={formik.touched.edId && Boolean(formik.errors.edId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='gracePeriod'
                label={labels.gracePeriod}
                maxLength={12}
                decimalScale={0}
                allowNegative={false}
                required
                onChange={e => {
                  formik.setFieldValue('gracePeriod', e.target?.value || null)
                }}
                onClear={() => formik.setFieldValue('gracePeriod', null)}
                value={formik.values.gracePeriod}
                error={formik.touched.gracePeriod && Boolean(formik.errors.gracePeriod)}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
