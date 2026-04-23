import { Grid } from '@mui/material'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import toast from 'react-hot-toast'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import * as yup from 'yup'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'

export default function TerminationForm ({ employeeId, labels, maxAccess, mainWindow, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      employeeId,
      date: new Date(),
      ttId: null,
      trId: null,
      rehire: null
    },
    validationSchema: yup.object({
      date: yup.date().required(),
      ttId: yup.number().required(),
      trId: yup.string().required(),
      rehire: yup.string().required()
    }),
    onSubmit: async () => {
      await postRequest({
        extension: EmployeeRepository.TerminationEmployee.set,
        record: JSON.stringify({
            ...formik.values,
            date: formatDateToApi(formik.values.date)
        })
      })

      toast.success(platformLabels.Saved)
      window.close()
      mainWindow.close()
    }
  })

  async function fillForm () { 
    if (!employeeId) return

    const res = await getRequest({
      extension: EmployeeRepository.TerminationEmployee.get,
      parameters: `_employeeId=${employeeId}`
    })

    const values = res?.record ? {...res.record, date: formatDateFromApi(res.record.date)} : formik.initialValues
    formik.setValues({
      ...values,
      isTerminated: !!res.record
    })
  }

  async function undoTermination () {
    await postRequest({
      extension: EmployeeRepository.TerminationEmployee.del,
      record: JSON.stringify({
        ...formik.values,
        date: formatDateToApi(formik.values.date)
      })
    })
    toast.success(platformLabels.Saved)
    window.close()
    mainWindow.close()
  }

  const actions = [
    {
      key: 'Undo',
      condition: formik.values.isTerminated,
      onClick: undoTermination
    }
  ]

  useEffect(() => {
   fillForm()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} isSaved={!formik.values.isTerminated} maxAccess={maxAccess} actions={actions} editMode={true}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                label={labels.date}
                value={formik.values?.date}
                maxAccess={maxAccess}
                required
                readOnly={formik.values.isTerminated}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
              />
            </Grid>
             <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TERMINATION_TYPE}
                name='ttId'
                label={labels.type}
                required
                readOnly={formik.values.isTerminated}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('ttId', '')}
                onChange={(_, newValue) => formik.setFieldValue('ttId', newValue?.key || '') }
                error={formik.touched.ttId && Boolean(formik.errors.ttId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={EmployeeRepository.TerminationReasons.qry}
                name='trId'
                label={labels.reason}
                valueField='recordId'
                maxAccess={maxAccess}
                required
                readOnly={formik.values.isTerminated}
                displayField='name'
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('trId', newValue?.recordId || null) }
                error={formik.touched.trId && Boolean(formik.errors.trId)}
              />
            </Grid>
             <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.REHIRE}
                name='rehire'
                label={labels.rehire}
                required
                readOnly={formik.values.isTerminated}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                onClear={() => formik.setFieldValue('rehire', '')}
                onChange={(_, newValue) => formik.setFieldValue('rehire', newValue?.key || '') }
                error={formik.touched.rehire && Boolean(formik.errors.rehire)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

