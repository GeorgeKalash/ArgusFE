import { useRouter } from 'next/router'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import Table from 'src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Box, Button } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ControlContext } from 'src/providers/ControlContext'
import { getButtons } from 'src/components/Shared/Buttons'
import { useResourceQuery } from 'src/hooks/resource'
import toast from 'react-hot-toast'

const BatchImports = () => {
    const router = useRouter()
    const [columns, setColumns] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [name, setName] = useState('');
    const [objectName, setObjectName] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const { getRequest, postRequest } = useContext(RequestsContext)
    const { resourceId } = router.query
    const { platformLabels } = useContext(ControlContext)
    const buttons = getButtons(platformLabels)
    const onClearButton = buttons.find(button => button.key === 'Clear')

    const {
      access,
      invalidate
    } = useResourceQuery({
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

              setObjectName(res.record.objectName)
              setEndPoint(res.record.endPoint)

              const modifiedFields = res.record.fields.map(({ name, ...rest }, index) =>  ({
                  field: name,
                  headerName: name,
                  flex: 1,
                  ...rest,
                  columnIndex: index
                }))
              
              setColumns([
                { field: 'recordId', headerName: '', flex: 1 },
                ...modifiedFields
              ])
            }
          } catch (exception) {
            console.error(exception)
          }
        })()
      }, [resourceId])
      
      const handleFileChange = (event) => {
        const file = event.target.files[0]

        setName(file.name)
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const text = e.target.result
            parseCSV(text)
          }
          reader.readAsText(file)
        }
      }

      const transform = (array) => {
        return {
            count: array?.length > 0 ? array.length : 0,
            list: array?.length > 0 ? array.map((item, index) => ({
                ...item,
                recordId: index + 1,
                minPrice: item.minPrice || 0,
                maxAccess: item.mandatory
            })) : [],
            statusId: 1,
            message: "",
            _startAt: 0
        };
    }
    
    const parseCSV = (text) => {
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(header => header.trim())

      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim())

        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]

          return obj
        }, {})
      })

      const dataFromCSV = transform(rows)
      setGridData(dataFromCSV)
      refetch();
    }

    const clearFile = () => {
      setName('');
      setGridData([]);
      document.getElementById('csvInput').value = null;
      refetch();
    };

    const refetch = () => {
      setGridData((prevData) => {
        const transformedData = transform(prevData.list);

        return transformedData;
      });
    };

    const getImportData = async () => {
      const data = {
        [objectName]: gridData.list.map(({ recordId, ...rest }) => ({
          ...rest
        }))
      }
      console.log(endPoint)

      try {
        await postRequest({
          extension: endPoint,
          record: JSON.stringify(data)
        })
              
        invalidate()
        
        toast.success(platformLabels.Imported)
      } catch (exception) {}

    }

    return (
        <VertLayout>
            <Fixed>
                <GridToolbar>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <CustomTextField
                      name='name'
                      label={platformLabels.SelectCSV}
                      value={name}
                      readOnly={true}
                      disabled={!!name}
                    />
                    <Button
                      sx={{ ml: 2 }}
                      variant='contained'
                      size='small'
                      disabled={!!name}
                      onClick={() => document.getElementById('csvInput').click()}
                    >
                      Browse...
                    </Button>
                    <Button
                      onClick={clearFile}
                      variant='contained'
                      sx={{
                        mr: 1,
                        ml: 1,
                        backgroundColor: onClearButton.color,
                        '&:hover': {
                          backgroundColor: onClearButton.color,
                          opacity: 0.8
                        },
                        border: onClearButton.border,
                        width: '50px !important',
                        height: '35px',
                        objectFit: 'contain',
                        minWidth: '30px !important'
                      }}
                      disabled={!name}
                    >
                      <img src={`/images/buttonsIcons/${onClearButton.image}`} alt={onClearButton.key} />
                    </Button>
                    <input
                        id="csvInput"
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e)}
                    />
                </Box>
                </GridToolbar>
            </Fixed>
            <Grow>
                <Table
                    columns={columns}
                    gridData={gridData}
                    refetch={refetch}
                    rowId={['recordId']}
                    isLoading={false}
                    pageSize={50}
                    paginationType='api'
                    pagination={false}
                    maxAccess={access}
                />
            </Grow>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: 7 }}>
              <Button
                variant='contained'
                sx={{
                  mr: 1,
                  ml: 3,
                  '&:hover': {
                    opacity: 0.8
                  },
                  border: onClearButton.border,
                  width: '50px !important',
                  height: '35px',
                  objectFit: 'contain',
                  minWidth: '30px !important'
                }}
                size='small'
                onClick={getImportData}
              >
                <img src={`/images/buttonsIcons/import.png`} alt={'Import'} />
              </Button>
            </Box>
        </VertLayout>
    )
}

export default BatchImports