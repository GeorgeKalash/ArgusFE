import { useForm } from 'src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { CommonContext } from 'src/providers/CommonContext'
import { ControlContext } from 'src/providers/ControlContext'

export default function MaterialsForm({ store, labels, maxAccess }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store
  const editMode = !!recordId

  const { formik } = useForm({
    initialValues: {
      modelId: recordId,
      items: [{ id: 1 }]
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async values => {}
  })

  const columns = [
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs'
    },
    {
      component: 'textfield',
      label: labels.size,
      name: 'size'
    },
    {
      component: 'numberfield',
      label: labels.weight,
      name: 'weight'
    }
  ]

  useEffect(() => {}, [])

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Modelling}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values?.items}
            error={formik.errors?.items}
            columns={columns}
            allowDelete={true}
            allowAddNewLine={true}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
