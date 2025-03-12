import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import { RequestsContext } from 'src/providers/RequestsContext'
import { DeliveryRepository } from 'src/repositories/DeliveryRepository'
import { CompositeBarChartDark } from '../../components/Shared/dashboardApplets/charts'
import { ResourceIds } from 'src/resources/ResourceIds'
import useResourceParams from 'src/hooks/useResourceParams'
import { debounce } from 'lodash'

const Frame = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100%;
`

const Container = styled.div`
  width: 100%;
  height: auto;
  padding: 10px;
  background: rgb(204, 204, 204);
  display: flex;
  flex-direction: column;
`

const ChartCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin-bottom: 10px;
  text-align: center;
`

const DashboardLayout = () => {
  const { getRequest, LoadingOverlay } = useContext(RequestsContext)
  const [chartsData, setChartsData] = useState([])
  const [loading, setLoading] = useState(true)
  const { labels } = useResourceParams({ datasetId: ResourceIds.UserDashboard })

  const debouncedCloseLoading = debounce(() => setLoading(false), 500)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Step 1: Fetch root zones (DE.rootSZ)
        const rootResponse = await getRequest({ extension: DeliveryRepository.GenerateTrip.root })

        if (!rootResponse.list || rootResponse.list.length === 0) {
          setChartsData([])
          debouncedCloseLoading()

          return
        }

        // Step 2: Fetch volumes for each sale zone (DE.volZO)
        const volumeRequests = rootResponse.list.map(async zone => {
          const response = await getRequest({
            extension: DeliveryRepository.Volume.vol,
            parameters: `_parentId=${zone.recordId}`
          })

          return {
            zoneName: zone.zoneName,
            volumes:
              response?.record?.saleZoneOrderVolumeSummaries?.map(summary => ({
                subZone: summary.zoneName ?? '',
                volume: summary.volume ?? 0
              })) ?? []
          }
        })

        const allChartsData = await Promise.all(volumeRequests)

        setChartsData(
          allChartsData.map(chart => ({
            zoneName: chart.zoneName,
            volumes: chart.volumes.filter(v => v.subZone && v.volume !== null && v.volume !== undefined)
          }))
        )
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        debouncedCloseLoading()
      }
    }

    fetchData()
  }, [])

  if (loading) return <LoadingOverlay />

  return (
    <Frame>
      <Container>
        {chartsData.map((chart, index) => (
          <ChartCard key={index}>
            <Title>
              {labels.deliveryVolumes} - {chart.zoneName}
            </Title>
            <CompositeBarChartDark
              id={`zonesVolumeChart-${index}`}
              labels={chart.volumes.map(v => v.subZone)}
              data={chart.volumes.map(v => v.volume)}
              label={labels.deliveryVolumes}
            />
          </ChartCard>
        ))}
      </Container>
    </Frame>
  )
}

export default DashboardLayout
