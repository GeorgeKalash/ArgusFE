import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { formatDateToApi } from 'src/lib/date-helper'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useWindow } from 'src/windows'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'

export default function RebuildACForm({ _labels, maxAccess }) {
  const { platformLabels } = useContext(ControlContext)
  const { postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    initialValues: {
      recordId: 'N/A',
      startDate: null,
      endDate: null,
      year: null,
      itemId: null,
      categoryId: null
    },
    maxAccess,
    validationSchema: yup.object({
      startDate: yup
        .date()
        .nullable()
        .test('start-before-end', 'Start date must be before end date', function (startDate) {
          const { endDate } = this.parent
          if (!startDate || !endDate) return true

          return startDate.getTime() <= endDate.getTime()
        }),
      endDate: yup
        .date()
        .nullable()
        .test('end-after-start', 'End date must be after start date', function (endDate) {
          const { startDate } = this.parent
          if (!startDate || !endDate) return true

          return endDate.getTime() >= startDate.getTime()
        }),
      year: yup.number().required(),
      categoryId: yup.number().required()
    }),
    onSubmit: async data => {
      const { itemId, ...rest } = data

      const dataFormatted = {
        ...rest,
        startDate: data.startDate ? formatDateToApi(data.startDate) : null,
        endDate: data.endDate ? formatDateToApi(data.endDate) : null,
        ...(itemId && { itemId })
      }

      const res = await postRequest({
        extension: InventoryRepository.RebuildAC.rebuild,
        record: JSON.stringify(dataFormatted)
      })

      stack({
        Component: ThreadProgress,
        props: {
          recordId: res.recordId
        },
        closable: false
      })

      toast.success(platformLabels.rebuild)
    }
  })

  const actions = [
    {
      key: 'Rebuild',
      condition: true,
      onClick: formik.handleSubmit,
      disabled: false
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.RebuildAC}
      actions={actions}
      editMode={true}
      isCleared={false}
      isSaved={false}
      form={formik}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='year'
                label={_labels.year}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('year', newValue?.fiscalYear || null)
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
                valueShow='itemSku'
                secondValueShow='itemName'
                form={formik}
                displayFieldWidth={2}
                onChange={(event, newValue) => {
                  formik.setFieldValue('itemSku', newValue?.sku || '')
                  formik.setFieldValue('itemName', newValue?.name || '')
                  formik.setFieldValue('itemId', newValue?.recordId || null)
                }}
                error={formik.touched.itemId && Boolean(formik.errors.itemId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={_labels.startDate}
                max={formik.values.endDate}
                value={formik.values?.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={_labels.endDate}
                value={formik.values?.endDate}
                min={formik.values.startDate}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Category.qry}
                parameters='_pagesize=30&_startAt=0&_name='
                name='categoryId'
                label={_labels.itemCategory}
                valueField='recordId'
                displayField='name'
                values={formik?.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('categoryId', newValue?.recordId || null)}
                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
