import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useForm } from 'src/hooks/form'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { ControlContext } from 'src/providers/ControlContext'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { FinancialRepository } from 'src/repositories/FinancialRepository'

const FinancialIntegrators = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const getGridData = async () => {
    const res = await getRequest({
      extension: SaleRepository.FinancialIntegrators.qry,
      parameters: `_filter=`
    })
    formik.setValues({
      ...formik.values,
      rows: res.list.map(({ ...rest }, index) => ({
        id: index + 1,
        ...rest
      }))
    })
  }

  const { labels: labels, maxAccess } = useResourceQuery({
    queryFn: getGridData,
    datasetId: ResourceIds.FinancialIntegrators
  })

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: []
    },
    onSubmit: async values => {
      await Promise.all(
        values.rows.map(row =>
          postRequest({
            extension: SaleRepository.FinancialIntegrators.set,
            record: JSON.stringify(row)
          })
        )
      )

      toast.success(platformLabels.Updated)
      await getGridData()
    }
  })

  const columns = [
    {
      component: 'resourcecombobox',
      name: 'cgId',
      label: labels.clientGroup,
      props: {
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'cgId' },
          { from: 'name', to: 'cgName' }
        ],
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      name: 'fgId',
      label: labels.financialGroup,
      props: {
        endpointId: FinancialRepository.Group.qry,
        valueField: 'recordId',
        displayField: 'name',
        mapping: [
          { from: 'recordId', to: 'fgId' },
          { from: 'name', to: 'fgName' },
          { from: 'reference', to: 'fgRef' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'checkbox',
      name: 'sameNumber',
      label: labels.sameNumber
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

export default FinancialIntegrators
