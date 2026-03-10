import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const iconOptions = [
  {
    key: 'Aid-kit',
    value: 'Aid-kit',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Aid-Kit.png').default.src
  },
  {
    key: 'Birthday',
    value: 'Birthday',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Birthday.png').default.src
  },
  {
    key: 'Calendar',
    value: 'Calendar',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Calendar.png').default.src
  },
  {
    key: 'Graduation',
    value: 'Graduation',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Graduation.png').default.src
  },
  {
    key: 'Engagement',
    value: 'Engagement',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Engagement.png').default.src
  },
  {
    key: 'Home',
    value: 'Home',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Home.png').default.src
  },
  {
    key: 'Injury',
    value: 'Injury',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Injury.png').default.src
  },
  {
    key: 'Maternity',
    value: 'Maternity',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Maternity.png').default.src
  },
  {
    key: 'Palm-Tree',
    value: 'Palm-Tree',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Palm-Tree.png').default.src
  },
  {
    key: 'Plane',
    value: 'Plane',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Plane.png').default.src
  },
  {
    key: 'Sport',
    value: 'Sport',
    icon: require('@argus/shared-ui/src/components/images/icons/project-icons/Sport.png').default.src
  }
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
        </Grow>
      </VertLayout>
      
    </FormShell>
  )
}
