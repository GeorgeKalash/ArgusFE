import { useForm } from 'src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'
import { ControlContext } from 'src/providers/ControlContext'

const PeriodsModuleForm = ({ recordId, labels, maxAccess, row, window }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const { platformLabels } = useContext(ControlContext)

  const editMode = !!recordId

  const post = async obj => {
    try {
      const data = {
        fiscalYear: recordId,
        periodId: row.periodId,
        fiscalModules: obj
          .filter(({ status }) => status !== 0)
          .map(({ id, status, ...rest }) => ({
            status: parseInt(status, 10),
            ...rest
          }))
      }

      await postRequest({
        extension: SystemRepository.FiscalModulePack.set2,
        record: JSON.stringify(data)
      })

      toast.success(platformLabels.Edited)
      window.close()
    } catch (error) {}
  }

  const { formik } = useForm({
    initialValues: {
      modules: []
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,

    onSubmit: async values => {
      await post(values.modules)
    }
  })

  const columns = [
    {
      component: 'textfield',
      label: labels.moduleName,
      name: 'moduleName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'resourcecombobox',
      label: labels?.status,
      name: 'statusName',
      props: {
        datasetId: DataSets.FY_PERIOD_STATUS,
        valueField: 'key',
        displayField: 'value',
        mapping: [
          { from: 'key', to: 'status' },
          { from: 'value', to: 'statusName' }
        ],
        columnsInDropDown: [{ key: 'value', value: 'Name' }],
        displayFieldWidth: 1
      }
    }
  ]

  useEffect(() => {
    if (recordId) getModules()
  }, [recordId])

  const getModules = () => {
    ;(async function () {
      try {
        const moduleData = await getAllModules()

        const res = await getRequest({
          extension: SystemRepository.FiscalModule.qry,
          parameters: `_fiscalYear=${recordId}&_periodId=${row.periodId}`
        })
        const modules = []

        moduleData.forEach(x => {
          const obj = {
            fiscalYear: recordId,
            periodId: row.periodId,
            moduleId: parseInt(x.key, 10),
            moduleName: x.value,
            status: 0,
            statusName: null
          }

          res?.list?.forEach(module => {
            if (module.moduleId === obj.moduleId) {
              obj.status = module.status
              obj.statusName = module.statusName
            }
          })

          modules.push(obj)
        })

        const mappedModules = modules.map(({ id, ...rest }, index) => {
          return {
            id: index + 1,
            ...rest
          }
        })

        formik.setFieldValue('modules', mappedModules)
      } catch (error) {}
    })()
  }

  async function getAllModules() {
    return new Promise((resolve, reject) => {
      getAllKvsByDataset({
        _dataset: DataSets.MODULE,
        callback: result => {
          if (result) resolve(result)
          else reject()
        }
      })
    })
  }

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.FiscalYears}
      maxAccess={maxAccess}
      editMode={editMode}
      isCleared={false}
      isInfo={false}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('modules', value)}
            value={formik.values?.modules}
            error={formik.errors?.modules}
            columns={columns}
            allowDelete={false}
            allowAddNewLine={false}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default PeriodsModuleForm
