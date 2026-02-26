import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const TargetForm = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId } = store

  const getGridData = async () => {
    const fiscalRes = await getRequest({
      extension: SystemRepository.FiscalYears.qry,
      parameters: '_filter='
    })

    const res = await getRequest({
      extension: SaleRepository.Target.qry,
      parameters: `_spId=${recordId}`
    })

    if (fiscalRes.list.length > 0) {
      const newRows = fiscalRes.list.map((fiscalYearObj, index) => {
        const correspondingTarget = res.list.find(targetObj => targetObj.fiscalYear === fiscalYearObj.fiscalYear)

        return {
          id: index + 1,
          spId: recordId,
          fiscalYear: String(fiscalYearObj?.fiscalYear),
          targetAmount: correspondingTarget?.targetAmount || 0
        }
      })

      formik.setValues({ rows: newRows })
    }
  }

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      rows: []
    },
    onSubmit: async obj => {
      const resultObject = {
        spId: recordId,
        items: obj.rows
      }

      await postRequest({
        extension: SaleRepository.Target.set2,
        record: JSON.stringify(resultObject)
      })

      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    if (recordId) {
      getGridData()
    }
  }, [recordId])

  const columns = [
    {
      component: 'textfield',
      label: labels.year,
      name: 'fiscalYear',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.targetAmount,
      name: 'targetAmount',
      props: {
        maxLength: 12,
        decimalScale: 0,
        allowNegative: false
      },
      updateOn: 'blur',
      onChange: ({ row: { update, newRow } }) => {
        update('targetAmount', newRow?.targetAmount || 0)
      },
      onClear: ({ row: { update } }) => {
        update('targetAmount', 0)
      }
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} isParentWindow={false}>
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => {
              formik.setFieldValue('rows', value)
            }}
            value={formik.values?.rows}
            error={formik.errors?.rows}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default TargetForm
