import React, { useEffect } from 'react'
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
import { useError } from 'src/error'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

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
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          columns={columns}
        />
      </Grow>
      <Fixed>
        <WindowToolbar onSave={formik.handleSubmit} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default CategoryLevels
