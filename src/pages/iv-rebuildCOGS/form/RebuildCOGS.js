import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { RGSaleRepository } from 'src/repositories/RGSaleRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

export default function RebuildAccountBalances({ _labels, access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: { year: '', itemId: 0, itemName: '', date: new Date(), recordId: 'N/A' },
    enableReinitialize: false,
    maxAccess: access,
    validateOnChange: true,

    validationSchema: yup.object({
      year: yup.string().required(),
      date: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const { recordId, ...rest } = obj

        await postRequest({
          extension: RGSaleRepository.RebuildCOGS.rebuild,
          record: JSON.stringify(rest)
        })

        toast.success(platformLabels.rebuild)
      } catch (error) {}
    }
  })

  const rebuild = () => {
    formik.handleSubmit()
  }

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: () => {
        rebuild()
      },
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.RebuildCOGS}
      form={formik}
      actions={actions}
      maxAccess={access}
      isSaved={false}
      isCleared={false}
      editMode={true}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='year'
                label={_labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={access}
                onChange={(event, newValue) => {
                  formik.setFieldValue('year', newValue?.fiscalYear)
                }}
                error={formik.touched.year && Boolean(formik.errors.year)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={InventoryRepository.Item.snapshot}
                name='itemId'
                label={_labels.item}
                valueField='sku'
                displayField='name'
                valueShow='itemRef'
                secondValueShow='itemName'
                form={formik}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemId', newValue?.recordId || 0)
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('itemRef', newValue?.sku || '')
                }}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={_labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={access}
                onClear={() => formik.setFieldValue('date', '')}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
