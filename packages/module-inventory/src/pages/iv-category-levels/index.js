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
import { useError } from '@argus/shared-providers/src/providers/error'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CategoryLevels = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack: stackError } = useError()

  const { labels: labels, access } = useResourceQuery({
    datasetId: ResourceIds.CategoryLevels
  })

  useEffect(() => {
    getGridData()
  }, [])

  async function getGridData() {
    const res = await getRequest({
      extension: InventoryRepository.CategoryLevel.qry
    })

    const processedData = res?.list?.map((item, index) => ({
      id: index + 1,
      ...item
    }))
    formik.setValues({ items: processedData })
  }

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object().shape({
          levelId: yup
            .number()
            .required()
            .integer()
            .min(0)
            .max(9)
            .test('is-unique', `${labels.levelIDUniqueMessage}`, function (value) {
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
          levelId: 0,
          name: ''
        }
      ]
    },
    onSubmit: async values => {
      const levelIds = values.items.map(item => item.levelId)

      const uniqueLevelIds = new Set()
      for (const id of levelIds) {
        if (uniqueLevelIds.has(id)) {
          stackError({ message: `${labels.duplicateLevelIdFound}: ${id}` })

          return
        }
        uniqueLevelIds.add(id)
      }

      const data = { items: values.items }
      await postRequest({
        extension: InventoryRepository.CategoryLevel.set2,
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
            name='items'
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CategoryLevels
