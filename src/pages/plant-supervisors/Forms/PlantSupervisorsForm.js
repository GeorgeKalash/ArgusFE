import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'

export default function PlantSupervisorsForm({ _labels: labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      plantId: '',
      rows: []
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      rows: yup.array().of(
        yup.object({
          username: yup.string().required()
        })
      )
    }),
    onSubmit: async values => {
      const payload = {
        plantId: values.plantId,
        supervisors: values.rows.map(row => ({
          supervisorId: row.supervisorId,
          plantId: values.plantId
        }))
      }
      await postRequest({
        extension: AccessControlRepository.PlantSupervisors.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Updated)

      fetchSupervisors()
    }
  })

  const fetchSupervisors = async () => {
    if (!formik.values.plantId) {
      formik.setFieldValue('rows', []); 

      return;
    }

    if (formik.values.plantId) {
      const res = await getRequest({
        extension: AccessControlRepository.PlantSupervisors.qry,
        parameters: `_plantId=${formik.values.plantId}`
      })

      if (res?.list?.length > 0) {
        const mappedRows = res?.list?.map((item, index) => ({
          ...item,
          id: index + 1
        }))
        formik.setFieldValue('rows', mappedRows)
      } else {
        formik.setFieldValue('rows', [
          {
            id: 1,
            supervisorId: ''
          }
        ])
      }
    }
  }

  useEffect(() => {
    fetchSupervisors()
  }, [formik.values.plantId])

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'username',
      label: labels.user,
      props: {
        endpointId: SystemRepository.Users.qry,
        parameters: `_startAt=0&_pageSize=100&_size=50&_sortBy=fullName&_filter=`,
        valueField: 'recordId',
        displayField: 'username',
        mapping: [
          { from: 'recordId', to: 'supervisorId' },
          { from: 'email', to: 'email' },
          { from: 'username', to: 'username' }
        ],
        columnsInDropDown: [
          { key: 'email', value: 'Email' },
          { key: 'username', value: 'Name' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: labels?.email,
      name: 'email',
      props: {
        readOnly: true
      }
    }
  ]

  return (
    <FormShell
      resourceId={ResourceIds.PlantSupervisors}
      isInfo={false}
      form={formik}
      maxAccess={maxAccess}
      editMode={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={labels.plant}
                valueField='recordId'
                displayField='name'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('plantId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
          </Grid>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', formik.values.plantId ? value : [])
            }}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowDelete={true}
            allowAddNewLine={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
