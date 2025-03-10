import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { IVReplenishementRepository } from 'src/repositories/IVReplenishementRepository'
import { useInvalidate } from 'src/hooks/resource'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const IvReplenishementsForm = ({ labels, maxAccess, setStore, store }) => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const { recordId } = store

  const invalidate = useInvalidate({
    endpointId: IVReplenishementRepository.IvReplenishements.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      siteId: '',
      dateFrom: null,
      dateTo: null,
      date: new Date(),
      notes: ''
    },
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      siteId: yup.string().required(),
      dateFrom: yup
        .date()
        .required()
        .test(function (value) {
          const { dateTo } = this.parent
          const dateFromNoTime = new Date(value).setHours(0, 0, 0, 0)
          const dateToNoTime = new Date(dateTo).setHours(0, 0, 0, 0)

          return dateFromNoTime <= dateToNoTime
        }),
      dateTo: yup
        .date()
        .required()
        .test(function (value) {
          const { date, dateFrom } = this.parent
          const dateToNoTime = new Date(value).setHours(0, 0, 0, 0)
          const dateFromNoTime = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null
          const dateNoTime = date ? new Date(date).setHours(0, 0, 0, 0) : null

          return dateToNoTime >= dateFromNoTime && dateToNoTime <= dateNoTime
        }),
      date: yup
        .date()
        .required()
        .test(function (value) {
          const { dateTo } = this.parent

          const dateNoTime = new Date(value).setHours(0, 0, 0, 0)
          const dateToNoTime = new Date(dateTo).setHours(0, 0, 0, 0)

          return dateNoTime >= dateToNoTime
        })
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: IVReplenishementRepository.IvReplenishements.set,
        record: JSON.stringify(obj)
      })

      if (!obj.recordId) {
        toast.success(platformLabels.Added)

        formik.setFieldValue('recordId', response.recordId)
        setStore(prevStore => ({
          ...prevStore,
          recordId: response.recordId
        }))
      } else toast.success(platformLabels.Edited)
      invalidate()
    }
  })
  const editMode = !!recordId
  console.log(formik, 'formik')
  async function getDefaultSiteId() {
    if (editMode) {
      return
    }

    const defaultSiteId = defaultsData?.list?.find(({ key }) => key === 'de_siteId')

    if (defaultSiteId?.value) formik.setFieldValue('siteId', parseInt(defaultSiteId?.value || ''))
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: IVReplenishementRepository.IvReplenishements.get,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,

          date: formatDateFromApi(res.record.date),
          dateFrom: formatDateFromApi(res.record.dateFrom),
          dateTo: formatDateFromApi(res.record.dateTo)
        })
      }
      await getDefaultSiteId()
    })()
  }, [])

  const onGenerate = async () => {
    await postRequest({
      extension: IVReplenishementRepository.GenerateIvReplenishements.generate,
      record: JSON.stringify(formik.values)
    })

    toast.success(platformLabels.Generated)
    invalidate()
  }

  const actions = [
    {
      key: 'RecordRemarks',
      condition: true,
      onClick: 'onRecordRemarks',
      disabled: !editMode
    },
    {
      key: 'generate',
      condition: true,
      onClick: onGenerate,
      disabled: !editMode
    }
  ]

  return (
    <FormShell
      form={formik}
      actions={actions}
      resourceId={ResourceIds.IvReplenishements}
      maxAccess={maxAccess}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={InventoryRepository.Site.qry}
                name='siteId'
                readOnly
                label={labels.site}
                values={formik.values}
                displayField='name'
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateFrom'
                max={formik.values.dateTo || formik.values.date}
                readOnly={editMode}
                label={labels.dateFrom}
                value={formik.values.dateFrom}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('dateFrom', null)}
                error={formik.touched.dateFrom && Boolean(formik.errors.dateFrom)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateTo'
                min={formik.values.dateFrom}
                max={formik.values.date}
                readOnly={editMode}
                label={labels.dateTo}
                value={formik.values.dateTo}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('dateTo', null)}
                error={formik.touched.dateTo && Boolean(formik.errors.dateTo)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                min={formik.values.dateTo}
                readOnly={editMode}
                label={labels.date}
                value={formik.values.date}
                onChange={formik.setFieldValue}
                required
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik.values.notes}
                maxLength='100'
                rows={2}
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default IvReplenishementsForm
