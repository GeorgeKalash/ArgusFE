import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { useWindow } from 'src/windows'
import MaterialsAdjustmentForm from '../materials-adjustment/Forms/MaterialsAdjustmentForm'
import useResourceParams from 'src/hooks/useResourceParams'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { labels: _labels, access } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview,
    datasetId: ResourceIds.GateKeeper
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview
  })

  const { labels: _labelsADJ, access: accessADJ } = useResourceParams({
    datasetId: ResourceIds.MaterialsAdjustment
  })

  const { formik } = useForm({
    access,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      rows: [
        {
          id: 1,
          recordId: '',
          functionId: '',
          seqNo: '',
          reference: '',
          date: null,
          itemId: '',
          sku: '',
          itemName: '',
          qty: '',
          qtyProduced: '',
          status: '',
          checked: false
        }
      ]
    },
    onSubmit: async values => {
      const copy = { ...values }
      let checkedObjects = copy.rows.filter(obj => obj.checked)

      if (checkedObjects.length > 0) {
        checkedObjects = checkedObjects.map(({ date, ...rest }) => ({
          date: formatDateToApi(date),
          ...rest
        }))

        const resultObject = {
          leanProductions: checkedObjects
        }

        const res = await postRequest({
          extension: ManufacturingRepository.MaterialsAdjustment.generate,
          record: JSON.stringify(resultObject)
        })
        if (res.recordId) {
          toast.success('Record Generated Successfully')
          invalidate()
          stack({
            Component: MaterialsAdjustmentForm,
            props: {
              recordId: res.recordId,
              labels: _labelsADJ,
              maxAccess: accessADJ
            },
            width: 900,
            height: 600,
            title: _labelsADJ[1]
          })
        }
      }
    }
  })
  async function fetchGridData() {
    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview,
      parameters: `_status=2`
    })

    const data = response.list.map((item, index) => ({
      ...item,
      id: index + 1,
      balance: item.qty - (item.qtyProduced ?? 0),
      date: formatDateFromApi(item?.date),
      checked: false
    }))
    formik.setValues({ rows: data })
  }

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'checked',
      async onChange({ row: { update, newRow } }) {
        update({
          produceNow: newRow.checked ? newRow.balance : ''
        })
      }
    },
    {
      component: 'textfield',
      name: 'sku',
      label: _labels[1],
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qty',
      label: _labels[2],
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'qtyProduced',
      label: _labels.produced,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'balance',
      label: _labels.balance,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'produceNow',
      label: _labels.producedNow,
      async onChange({ row: { update, newRow } }) {
        console.log('check row', newRow)
        if (newRow.produceNow > newRow.balance) {
          update({
            produceNow: newRow.balance
          })
        }
      }
    },
    {
      component: 'textfield',
      name: 'itemName',
      label: _labels.itemName,
      flex: 2,
      props: {
        readOnly: true
      }
    },
    {
      component: 'date',
      name: 'date',
      label: _labels[6],
      flex: 2,
      props: {
        readOnly: true
      }
    }
  ]

  const actions = [
    {
      key: 'Refresh',
      condition: true,
      onClick: () => invalidate(),
      disabled: false
    }
  ]

  return (
    <FormShell form={formik} infoVisible={false} isCleared={false}>
      <VertLayout>
        <Fixed>
          <GridToolbar actions={actions} />
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('rows', value)}
            value={formik.values.rows}
            error={formik.errors.rows}
            columns={columns}
            allowAddNewLine={false}
            allowDelete={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default GateKeeper
