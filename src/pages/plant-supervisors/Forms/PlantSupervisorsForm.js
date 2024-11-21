import { Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

export default function PlantSupervisorsForm({ _labels: labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [userStore, setUserStore] = useState([])

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      plantId: '',
      rows: [
        {
          supervisorId: ''
        }
      ]
    },
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      plantId: yup.string().required(),
      rows: yup.array().of(
        yup.object({
          supervisorId: yup.string().required()
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

  const editMode = !!formik.values.recordId

  const fetchSupervisors = async () => {
    if (formik.values.plantId) {
      const res = await getRequest({
        extension: AccessControlRepository.PlantSupervisors.qry,
        parameters: `_plantId=${formik.values.plantId}`
      })

      if (res?.list?.length > 0) {
        const mappedRows = res.list.map(item => ({
          supervisorId: item.supervisorId,
          username: item.username,
          email: item.email,
          plantId: item.plantId
        }))
        formik.setFieldValue('rows', mappedRows)
      } else {
        formik.setFieldValue('rows', [
          {
            supervisorId: ''
          }
        ])
      }
    }
  }

  useEffect(() => {
    fetchSupervisors()
  }, [formik.values.plantId])

  const fetchUsers = async () => {
    const res = await getRequest({
      extension: SystemRepository.Users.qry,
      parameters: `_startAt=0&_pageSize=100&_size=50&_sortBy=fullName&_filter=`
    })
    setUserStore(res.list || [])
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const columns = [
    {
      field: 'textfield',
      header: labels.email,
      name: 'email',
      readOnly: true
    },
    {
      field: 'combobox',
      header: labels.user,
      nameId: 'supervisorId',
      name: 'username',
      mandatory: true,
      store: userStore,
      valueField: 'recordId',
      displayField: 'username',
      fieldsToUpdate: [
        { from: 'username', to: 'name' },
        { from: 'email', to: 'email' }
      ],
      widthDropDown: 300,
      columnsInDropDown: [
        { key: 'username', value: 'Name' },
        { key: 'email', value: 'Email' }
      ]
    }
  ]

  return (
    <FormShell resourceId={ResourceIds.PlantSupervisors} form={formik} maxAccess={maxAccess} editMode={editMode}>
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
            <Grid item xs={12}>
              <InlineEditGrid
                gridValidation={formik}
                maxAccess={maxAccess}
                columns={columns}
                defaultRow={{
                  supervisorId: '',
                  plantId: formik.values.plantId
                }}
                allowAddNewLine={true}
                allowDelete={false}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
