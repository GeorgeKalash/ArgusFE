import { useContext, useEffect } from 'react'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const SerialProfileSequences = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const createRowValidation = term =>
    yup.mixed().test(function (value) {
      const { position, str, sectionType, size, oper } = this.parent
      const isAnyFieldFilled = !!(position || str || sectionType || size || oper)

      if (term === 'oper') {
        if (sectionType != 1) {
          return true
        }

        return !!value
      }

      if (term === 'position' && !!position) {
        if (Number(position) > 20) {
          return false
        }

        return value !== null
      }

      return isAnyFieldFilled ? value !== null && value !== undefined : true
    })

  const components = yup.array().of(
    yup.object({
      position: createRowValidation('position'),
      str: createRowValidation(),
      sectionType: createRowValidation(),
      size: createRowValidation(),
      oper: createRowValidation('oper')
    })
  )

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    initialValues: {
      spfId: recordId,
      components: [
        {
          id: 1,
          spfId: recordId,
          sectionType: null,
          position: null,
          seqNo: 1
        }
      ]
    },
    validationSchema: yup.object({
      components
    }),
    onSubmit: async values => {
      const modifiedItems = values?.components.map((details, index) => {
        return {
          ...details,
          id: index + 1,
          seqNo: index + 1,
          spfId: recordId
        }
      })

      await postRequest({
        extension: InventoryRepository.SerialsProfile.set2,
        record: JSON.stringify({ spfId: recordId, components: modifiedItems })
      }).then(() => {
        fetchGridData()
        toast.success(platformLabels.Edited)
      })
    }
  })

  const editMode = !!recordId

  async function fetchGridData() {
    const res = await getRequest({
      extension: InventoryRepository.SerialsProfileSequences.qry,
      parameters: `_spfId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length !== 0
        ? await Promise.all(
            res.list.map(async (item, index) => {
              return {
                ...item,
                id: index + 1,
                oper: item.oper || 0
              }
            })
          )
        : formik.initialValues.components

    formik.setValues({
      spfId: recordId,
      components: updateItemsList
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [])

  const columns = [
    {
      component: 'numberfield',
      label: labels.position,
      name: 'position',
      props: {
        decimalScale: 0,
        allowNegative: false
      }
    },
    {
      component: 'resourcecombobox',
      name: 'sectionType',
      label: labels.sectionType,
      props: {
        datasetId: DataSets.SERIAL_PROFILE_SECTION,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'sectionType' },
          { from: 'value', to: 'sectionTypeName' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.str,
      name: 'str',
      props: {
        maxLength: 20
      }
    },
    {
      component: 'resourcecombobox',
      name: 'oper',
      label: labels.oper,
      props: {
        datasetId: DataSets.SERIAL_PROFILE_OPERATOR,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'oper' },
          { from: 'value', to: 'operatorName' }
        ]
      },
      propsReducer({ row, props }) {
        return {
          ...props,
          readOnly: Number(row.sectionType) !== 1
        }
      }
    },
    {
      component: 'numberfield',
      label: labels.size,
      name: 'size',
      props: {
        maxLength: 4,
        decimalScale: 0
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode} isParentWindow={false}>
      <DataGrid
        onChange={value => formik.setFieldValue('components', value)}
        value={formik.values.components}
        error={formik.errors.components}
        columns={columns}
        maxAccess={maxAccess}
        name='components'
      />
    </Form>
  )
}

export default SerialProfileSequences
