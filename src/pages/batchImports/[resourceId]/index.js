import { useRouter } from 'next/router'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useRef, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Button, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { useResourceQuery } from 'src/hooks/resource'
import toast from 'react-hot-toast'
import { formatDate, formatDateDefault } from 'src/lib/date-helper'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'
import { useWindow } from 'src/windows'
import { useError } from 'src/error'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

const transform = array => {
  return {
    count: array?.length > 0 ? array.length : 0,
    list:
      array?.length > 0
        ? array.map((item, index) => ({
            ...item,
            recordId: index + 1,
            minPrice: item.minPrice || 0,
            maxAccess: item.mandatory
          }))
        : [],
    statusId: 1,
    message: '',
    _startAt: 0
  }
}

const convertValue = (value, dataType, isAPI = false) => {
  if (value === '') {
    return value
  }
  switch (dataType) {
    case 2:
      return parseInt(value, 10)
    case 3:
      return parseFloat(value)
    case 5:
      return isAPI ? formatDateForImport(value) : formatDateDefault(formatDate(value))
    default:
      return value
  }
}

const parseCSV = (text, columns) => {
  const lines = text.split('\n').filter(line => line.trim())

  if (lines.length === 0) return

  const headers = lines[0].split(',').map(header => header.trim())

  const columnMap = columns.reduce((map, col) => {
    map[col.headerName] = col

    return map
  }, {})

  const orderedColumns = headers.map(header => columnMap[header])

  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim())

    return orderedColumns.reduce((obj, col, index) => {
      const header = headers[index]
      if (col) {
        obj[col.field] = convertValue(values[index], col.dataType)
      } else {
        obj[header] = values[index]
      }

      return obj
    }, {})
  })

  return transform(rows)
}

const getImportData = (gridData, columns) => {
  const mandatoryColumns = columns.filter(col => col.mandatory)

  const missingFields = gridData.list.flatMap(row =>
    mandatoryColumns
      .filter(col => row[col.field] === null || row[col.field] === undefined || row[col.field] === '')
      .map(col => col.headerName)
  )

  if (missingFields.length > 0) {
    const uniqueMissingFields = [...new Set(missingFields)]
    throw new Error(
      `${uniqueMissingFields.join(', ')} ${uniqueMissingFields.length > 1 ? 'are' : 'is'} mandatory field${
        uniqueMissingFields.length > 1 ? 's' : ''
      }.`
    )
  }

  const convertedData = gridData.list.map(row => {
    return Object.keys(row).reduce((acc, key) => {
      const col = columns.find(c => c.field === key)
      let value = row[key]
      value = value === '' ? null : value
      acc[key] = col ? convertValue(value, col.dataType, true) : value

      return acc
    }, {})
  })

  return convertedData
}

const formatDateForImport = dateString => {
  const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10))
  const fullYear = year < 100 ? 2000 + year : year
  const date = new Date(Date.UTC(fullYear, month - 1, day, 0, 0, 0))

  return date.toISOString().split('.')[0] + 'Z'
}

const BatchImports = () => {
  const { stack } = useWindow()
  const { stack: stackError } = useError()
  const router = useRouter()

  const [parsedFileContent, setParsedFileContent] = useState([])
  const [file, setFile] = useState(null)
  const imageInputRef = useRef(null)

  const [importsConfiguration, setImportsConfiguration] = useState([])
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { resourceId } = router.query
  const { platformLabels } = useContext(ControlContext)

  const { access } = useResourceQuery({
    datasetId: resourceId
  })

  useEffect(() => {
    ;(async function () {
      try {
        if (resourceId) {
          const res = await getRequest({
            extension: SystemRepository.ETL.get,
            parameters: `_resourceId=${resourceId}`
          })

          setImportsConfiguration(res)
        }
      } catch (exception) {}
    })()
  }, [])

  const modifiedFields =
    importsConfiguration?.record?.fields?.map(({ name, dataType, ...rest }) => ({
      field: name,
      headerName: name,
      type: dataType === 2 || dataType === 3 ? 'number' : undefined,
      ...rest
    })) || []

  const columns = [{ field: 'recordId', headerName: '' }, ...modifiedFields]
  const objectName = importsConfiguration?.record?.objectName || ''
  const endPoint = importsConfiguration?.record?.endPoint || ''

  const handleFileChange = event => {
    const file = event.target.files[0]

    setFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target.result
        const data = parseCSV(text, columns)
        setParsedFileContent(data)
      }
      reader.readAsText(file)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsedFileContent([])
    imageInputRef.current.value = null
  }

  const handleClick = async () => {
    try {
      const convertedData = getImportData(parsedFileContent, columns)

      const data = {
        [objectName]: convertedData
      }

      try {
        const res = await postRequest({
          extension: endPoint,
          record: JSON.stringify(data)
        })

        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId,
            access
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })

        toast.success(platformLabels.Imported)
      } catch (exception) {}
    } catch (error) {
      stackError({
        message: error?.message
      })
    }
  }

  const actions = [
    {
      key: 'Import',
      condition: true,
      onClick: () => handleClick(),
      disabled: !file?.name
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          leftSection={
            <Grid item sx={{ display: 'flex', mr: 2 }}>
              <CustomTextField
                name='name'
                label={platformLabels.SelectCSV}
                value={file?.name}
                readOnly={true}
                disabled={!!file?.name}
              />
              <Button
                sx={{ ml: 6, minWidth: '90px !important' }}
                variant='contained'
                size='small'
                disabled={!!file?.name}
                onClick={() => imageInputRef.current.click()}
              >
                {platformLabels.Browse}...
              </Button>
              <input
                type='file'
                accept='.csv'
                ref={imageInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Button
                onClick={clearFile}
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': {
                    backgroundColor: '#f44336',
                    opacity: 0.8
                  },
                  ml: 2
                }}
                variant='contained'
              >
                <img src='/images/buttonsIcons/clear.png' alt={platformLabels.Clear} />
              </Button>
            </Grid>
          }
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={parsedFileContent}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          pagination={false}
          maxAccess={access}
          textTransform={true}
        />
      </Grow>
      <Fixed>
        <WindowToolbar smallBox={true} actions={actions} />
      </Fixed>
    </VertLayout>
  )
}

export default BatchImports
