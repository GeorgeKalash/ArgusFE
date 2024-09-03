import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { SCRepository } from 'src/repositories/SCRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'

const Sites = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      search: '',
      rows: [
        {
          id: 1,
          siteId: '',
          siteName: '',
          siteRef: '',
          statusName: '',
          notes: '',
          isChecked: false
        }
      ]
    },
    onSubmit: async () => {
      try {
        const itemsList = formik.values.rows
          .map((item, index) => ({
            ...item,
            id: index + 1,
            status: item.status || 1
          }))
          .filter(item => item.isChecked); 


        const data = {
          stockCountId: recordId,
          sites: itemsList
        }

        await postRequest({
          extension: SCRepository.Sites.set2,
          record: JSON.stringify(data)
        })

        await fetchGridData(recordId)

        toast.success(platformLabels.Updated)
      } catch (error) {}
    }
  })

  const fetchGridData = async recordId => {
    try {
      if (recordId) {
        const response = await getRequest({
          extension: SCRepository.Sites.qry,
          parameters: `_stockCountId=${recordId}`
        })
  
        const data = response.list.map((item, index) => ({
          ...item,
          id: index + 1
        }))
  
        formik.setValues({ rows: data })
      }
      
    } catch (error) {}
  }

  const filteredData = formik.values.search
    ? formik.values.rows.filter(
        item =>
          (item.siteRef && item.siteRef.toString().includes(formik.values.search.toLowerCase())) ||
          (item.siteName && item.siteName.toLowerCase().includes(formik.values.search.toLowerCase()))
      )
    : formik.values.rows

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'isChecked',
      flex: 1,
      editable: true
    },
    {
      component: 'textfield',
      name: 'siteRef',
      label: labels.siteRef,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'siteName',
      label: labels.name,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'statusName',
      label: labels.statusName,
      flex: 1,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'notes',
      label: labels.notes,
      flex: 2,
      props: {
        readOnly: false
      },
      propsReducer({ row, props }) {
        return { ...props, readOnly: row.statusName != 'Processed' }
      }
    }
  ]

  const handleSearchChange = event => {
    const { value } = event.target
    formik.setFieldValue('search', value)
  }

  function handleRowsChange(newValues) {
    const updatedRows = formik.values.rows.map(row => {
      const newValue = newValues.find(newRow => newRow.id === row.id)

      return newValue ? newValue : row
    })

    formik.setFieldValue('rows', updatedRows)
  }
  
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchGridData(recordId)
      }
    })()
  }, [recordId])

  return (
    <FormShell
      form={formik}
      infoVisible={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Fixed>
            <CustomTextField
              name='search'
              value={formik.values.search}
              label={labels.search}
              onClear={() => {
                formik.setFieldValue('search', '')
                fetchGridData()
              }}
              sx={{ width: '30%' }}
              onChange={handleSearchChange}
            />
          </Fixed>
          <Grow>
            <DataGrid
              onChange={value => handleRowsChange(value)}
              value={filteredData}
              error={formik.errors.rows}
              columns={columns}
              allowAddNewLine={false}
              allowDelete={false}
            />
          </Grow>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Sites
