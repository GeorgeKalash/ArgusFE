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
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'

const PartsForm = ({ seqNo, access, labels, recordId }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess: access,
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      search: '',
      rows: []
    },
    onSubmit: async () => {
      const itemsList = formik.values.rows
        .map((item, index) => ({
          ...item,
          id: index + 1,
          status: item.status || 1
        }))
        .filter(item => item.isChecked)

      const data = {
        stockCountId: recordId,
        sites: itemsList
      }

      await postRequest({
        extension: SCRepository.Sites.set2,
        record: JSON.stringify(data)
      })

      await fetchGridData(recordId)
      setRefreshController(!refreshController)
      toast.success(platformLabels.Updated)
      formik.setFieldValue('search', '')
    }
  })

  const fetchGridData = async recordId => {
    if (recordId) {
      const response = await getRequest({
        extension: RepairAndServiceRepository.WorkOrderParts.qry,
        parameters: `_workOrderId=${recordId}&_seqNo=${seqNo}`
      })

      const data = response.list?.map((item, index) => ({
        ...item,
        id: index + 1
      }))

      formik.setValues({ rows: data })
    }
  }

  const columns = [
    {
      component: 'checkbox',
      label: ' ',
      name: 'isChecked',
      flex: 1
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
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await fetchGridData(recordId)
      }
    })()
  }, [])

  return (
    <FormShell form={formik} infoVisible={false} isSavedClear={false} isCleared={false}>
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
            />
          </Fixed>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('rows', value)}
              value={formik.values.rows}
              error={formik.errors.rows}
              columns={columns}
              allowAddNewLine={false}
              allowDelete={false}
              maxAccess={access}
            />
          </Grow>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PartsForm
