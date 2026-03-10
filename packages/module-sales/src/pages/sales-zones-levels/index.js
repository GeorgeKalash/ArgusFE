import React, { useEffect } from 'react'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SalesZonesLevels = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.SalesZoneLevels
  })

  useEffect(() => {
    getGridData()
  }, [])

  function getGridData() {
    getRequest({
      extension: SaleRepository.SaleZoneLevel.qry
    })
      .then(res => {
        const result = res.list

        const processedData = result.map((item, index) => ({
          id: index + 1,
          levelId: item?.levelId,
          name: item?.name
        }))
        if (res.list.length > 0) formik.setValues({ items: processedData })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object().shape({
          levelId: yup
            .number()
            .required('Level ID is required')
            .integer('Level ID must be an integer')
            .min(0, 'Level ID must be at least 0')
            .max(9, 'Level ID must be no more than 9')
            .test('is-unique', 'Level ID must be unique', function (value) {
              const { parent } = this
              const itemList = formik.values.items
              const duplicate = itemList.find(item => item.levelId === value && item.id !== parent.id)

              return !duplicate
            }),
          name: yup.string().required()
        })
      )
    }),
    initialValues: {
      items: [
        {
          id: 1,
          levelId: null,
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      const levelIds = values.items.map(item => item.levelId)

      const uniqueLevelIds = new Set()
      for (const id of levelIds) {
        if (uniqueLevelIds.has(id)) {
          stackError({ message: `Duplicate Level ID found: ${id}` })

          return
        }
        uniqueLevelIds.add(id)
      }

      const data = { items: values.items }
      await postRequest({
        extension: SaleRepository.SaleZoneLevel.set2,
        record: JSON.stringify(data)
      })
      toast.success(platformLabels.Saved)
    }
  })

  const columns = [
    {
      component: 'numberfield',
      label: labels.levelId,
      name: 'levelId'
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'name'
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} fullSize>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default SalesZonesLevels
