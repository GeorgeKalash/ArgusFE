import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { DataSets } from 'src/resources/DataSets'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomButton from 'src/components/Inputs/CustomButton'
import FlagsForm from './FlagsForm'
import { useWindow } from 'src/windows'
import { useInvalidate } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function NodeForm({ labels, maxAccess, setStore, store }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, fsId } = store
  const editMode = !!recordId
  const { stack } = useWindow()

  const invalidate = useInvalidate({
    endpointId: FinancialStatementRepository.Node.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      fsId,
      reference: '',
      parentId: null,
      TBAmount: null,
      numberFormat: null,
      displayOrder: null,
      description: ''
    },
    validationSchema: yup.object({
      reference: yup.string().required(),
      TBAmount: yup.number().required(),
      numberFormat: yup.number().required(),
      displayOrder: yup.number().required().min(1).max(99)
    }),
    onSubmit: async obj => {
      const res = await postRequest({
        extension: FinancialStatementRepository.Node.set,
        record: JSON.stringify(obj)
      })

      if (!obj?.recordId) {
        formik.setFieldValue('recordId', res.recordId)
        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId
        }))
      }
      toast.success(!obj?.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: FinancialStatementRepository.Node.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.FinancialStatements} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='reference'
                label={labels.reference}
                value={formik.values.reference}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('reference', '')}
                error={formik.touched.reference && Boolean(formik.errors.reference)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={FinancialStatementRepository.Node.qry}
                parameters={`_fsId=${fsId}`}
                name='parentId'
                label={labels.parent}
                valueField='recordId'
                displayField='reference'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('parentId', newValue?.recordId || null)
                }}
                error={formik.touched.parentId && Boolean(formik.errors.parentId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLFS_TB_AMOUNT}
                name='TBAmount'
                label={labels.amount}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('TBAmount', newValue?.key || null)
                }}
                error={formik.touched.TBAmount && Boolean(formik.errors.TBAmount)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GLFS_NB_FORMAT}
                name='numberFormat'
                label={labels.format}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('numberFormat', newValue?.key || null)
                }}
                error={formik.touched.numberFormat && Boolean(formik.errors.numberFormat)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='displayOrder'
                required
                label={labels.order}
                value={formik.values.displayOrder}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('displayOrder', '')}
                error={formik.touched.displayOrder && Boolean(formik.errors.displayOrder)}
                maxLength={2}
                decimalScale={0}
                allowNegative={false}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='description'
                label={labels.description}
                value={formik.values.description}
                rows={2}
                maxLength='40'
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('description', '')}
                error={formik.touched.description && Boolean(formik.errors.description)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomButton
                onClick={() => {
                  stack({
                    Component: FlagsForm,
                    props: {
                      recordId,
                      fsId,
                      labels,
                      maxAccess
                    },
                    width: 700,
                    title: labels.flags
                  })
                }}
                label={labels.flag}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
