import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import { DataSets } from 'src/resources/DataSets'

const iconOptions = [
  { key: 'Aid-kit', value: 'Aid-kit', icon: '/images/icons/project-icons/Aid-kit.png' },
  { key: 'Birthday', value: 'Birthday', icon: '/images/icons/project-icons/Birthday.png' },
  { key: 'Calendar', value: 'Calendar', icon: '/images/icons/project-icons/Calendar.png' },
  { key: 'Graduation', value: 'Graduation', icon: '/images/icons/project-icons/Graduation.png' },
  { key: 'Engagement', value: 'Engagement', icon: '/images/icons/project-icons/Engagement.png' },
  { key: 'Home', value: 'Home', icon: '/images/icons/project-icons/Home.png' },
  { key: 'Injury', value: 'Injury', icon: '/images/icons/project-icons/Injury.png' },
  { key: 'Maternity', value: 'Maternity', icon: '/images/icons/project-icons/Maternity.png' },
  { key: 'Palm-Tree', value: 'Palm-Tree', icon: '/images/icons/project-icons/Palm-Tree.png' },
  { key: 'Plane', value: 'Plane', icon: '/images/icons/project-icons/Plane.png' },
  { key: 'Sport', value: 'Sport', icon: '/images/icons/project-icons/Sport.png' }
]

export default function LeaveScheduleForm({ labels, maxAccess, store, setStore }) {
  const { recordId } = store
  const { platformLabels } = useContext(ControlContext)

  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: LoanManagementRepository.LeaveScheduleFilters.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      name: '',
      reference: '',
      ltId: null,
      firstAccrual: null,
      coDate: null,
      accrualActivation: null,
      dayType: null,
      iconName: ''
    },
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      reference: yup.string().required(),
      ltId: yup.number().required(),
      firstAccrual: yup.number().required(),
      coDate: yup.number().required(),
      accrualActivation: yup.number().required(),
      dayType: yup.number().required()
    }),
    onSubmit: values => {
      postRequest({
        extension: LoanManagementRepository.LeaveScheduleFilters.set,
        record: JSON.stringify(values)
      }).then(res => {
        formik.setFieldValue('recordId', res.recordId)
        toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

        setStore(prevStore => ({
          ...prevStore,
          recordId: res.recordId,
          lsId: res.recordId
        }))

        invalidate()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: LoanManagementRepository.LeaveScheduleFilters.get,
          parameters: `_recordId=${recordId}`
        })

        const apiRecord = res.record

        const matchedIcon = iconOptions.find(opt => opt.key === apiRecord.iconName) || null

        formik.setValues({
          ...apiRecord,
          icon: matchedIcon,
          iconName: apiRecord.iconName || ''
        })
      }
    })()
  }, [recordId])

  return (
    <FormShell resourceId={ResourceIds.LeaveSchedule} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={labels.reference}
            value={formik.values.reference}
            required
            maxAccess={maxAccess}
            maxLength='10'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('reference', '')}
            error={formik.touched.reference && Boolean(formik.errors.reference)}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={labels.name}
            value={formik.values.name}
            required
            maxAccess={maxAccess}
            maxLength='30'
            onChange={formik.handleChange}
            onClear={() => formik.setFieldValue('name', '')}
            error={formik.touched.name && Boolean(formik.errors.name)}
          />
        </Grid>

        <Grid item xs={12}>
          <ResourceComboBox
            endpointId={LoanManagementRepository.IndemnityAccuralsFilters.qry}
            filter={item => item.isPaid}
            name='ltId'
            label={labels.ltId}
            required
            valueField='recordId'
            displayField='name'
            values={formik.values}
            readOnly={editMode}
            onChange={(event, newValue) => {
              formik.setFieldValue('ltId', newValue?.recordId || null)
            }}
            error={formik.touched.ltId && Boolean(formik.errors.ltId)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.FIRST_ACCRUAL}
            name='firstAccrual'
            label={labels.firstAccrual}
            values={formik.values}
            valueField='key'
            displayField='value'
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('firstAccrual', newValue?.key || null)
            }}
            error={formik.touched.firstAccrual && Boolean(formik.errors.firstAccrual)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.CARRY_OVER_DATE}
            name='coDate'
            label={labels.coDate}
            values={formik.values}
            valueField='key'
            displayField='value'
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('coDate', newValue?.key || null)
            }}
            error={formik.touched.coDate && Boolean(formik.errors.coDate)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.ACCRUAL_ACTIVATION}
            name='accrualActivation'
            label={labels.accrualActivation}
            values={formik.values}
            valueField='key'
            displayField='value'
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('accrualActivation', newValue?.key || null)
            }}
            error={formik.touched.accrualActivation && Boolean(formik.errors.accrualActivation)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            datasetId={DataSets.WORKING_DAYS}
            name='dayType'
            label={labels.dayType}
            values={formik.values}
            valueField='key'
            displayField='value'
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              formik.setFieldValue('dayType', newValue?.key || null)
            }}
            error={formik.touched.dayType && Boolean(formik.errors.dayType)}
          />
        </Grid>
        <Grid item xs={12}>
          <ResourceComboBox
            name='icon'
            label={labels.icon}
            valueField='key'
            displayField='value'
            values={formik.values}
            onChange={(event, newValue) => {
              formik.setFieldValue('icon', newValue || null)
              formik.setFieldValue('iconName', newValue?.key || '')
            }}
            options={iconOptions}
            maxAccess={maxAccess}
            error={formik.touched.icon && Boolean(formik.errors.icon)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
