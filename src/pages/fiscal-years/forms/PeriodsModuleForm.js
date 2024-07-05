import { useForm } from 'src/hooks/form'
import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { DataSets } from 'src/resources/DataSets'
import { CommonContext } from 'src/providers/CommonContext'

const PeriodsForm = ({ recordId, labels, maxAccess, row, window, editMode }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const post = obj => {
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

    console.log('data')
    console.log(data)
    postRequest({
      extension: SystemRepository.FiscalModulePack.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Edited Successfully')
        window.close()
      })
      .catch(error => {})
  }

  const { formik } = useForm({
    initialValues: {
      modules: []
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,

    /* validationSchema: yup.object({
        modules: yup
        .array()
        .of(
          yup.object().shape({
            statusName: yup.string().required(' '),
            startDate: yup.string().required(' '),
            endDate: yup.string().required(' ')
          })
        )
        .required(' ')
    }), */
    onSubmit: values => {
      post(values.modules)
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
        widthDropDown: 200,
        mapping: [
          { from: 'key', to: 'status' },
          { from: 'value', to: 'statusName' }
        ],
        columnsInDropDown: [{ key: 'value', value: 'Name' }],
        displayFieldWidth: 2
      }
    }
  ]

  useEffect(() => {
    recordId && getModules()
  }, [recordId])

  const getModules = () => {
    ;(async function () {
      console.log('in')
      const moduleData = await getAllModules()
      console.log(moduleData)
      const defaultParams = `_fiscalYear=${recordId}&_periodId=${row.periodId}`
      var parameters = defaultParams
      getRequest({
        extension: SystemRepository.FiscalModule.qry,
        parameters: parameters
      })
        .then(res => {
          console.log('here res')
          console.log(res)

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

          console.log('modules')
          console.log(modules)

          const mappedModules = modules.map(({ id, ...rest }, index) => {
            return {
              id: index + 1,
              ...rest
            }
          })

          console.log('mappedModules', mappedModules)

          formik.setValues({
            modules: mappedModules
          })
        })
        .catch(error => {})
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

export default PeriodsForm
