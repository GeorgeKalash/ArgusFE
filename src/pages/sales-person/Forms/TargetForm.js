import { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'

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
        update('targetAmount', newRow.targetAmount || 0)
      }
    }
  ]

  return (
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
      <Fixed>
        <WindowToolbar onSave={formik.submitForm} isSaved={true} smallBox={true} />
      </Fixed>
    </VertLayout>
  )
}

export default TargetForm
