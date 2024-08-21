import React from 'react'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { SaleRepository } from 'src/repositories/SaleRepository'

const SalesZonesLevels = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.SalesZoneLevels
  })

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      rows: yup
        .array()
        .of(
          yup.object().shape({
            name: yup.string().required()
          })
        )
        .required()
    }),
    initialValues: {
      rows: [
        {
          id: 1,
          levelId: null,
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      try {
        const data = {
          items: values.rows
        }

        await postRequest({
          extension: SaleRepository.SaleZoneLevel.set2,
          record: JSON.stringify(data)
        })
        toast.success(platformLabels.Saved)
      } catch (error) {}
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.levelId,
      name: 'levelId',
      props: { readOnly: true }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('rows', value)}
          value={formik.values.rows}
          error={formik.errors.rows}
          columns={columns}
          allowDelete={false}
          allowAddNewLine={false}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default SalesZonesLevels
