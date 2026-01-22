import React, { useEffect, useState, useContext } from 'react'
import styled from 'styled-components'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DeliveryRepository } from '@argus/repositories/src/repositories/DeliveryRepository'
import { HorizontalBarChartDark } from '@argus/shared-ui/src/components/Shared/dashboardApplets/charts'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { debounce } from 'lodash'
import { DefaultsContext } from '@argus/shared-providers/src/providers/DefaultsContext'

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
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 10px;
`

const ChartCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 10px;
  height: auto;
  display: flex;
  flex-direction: column;
`

const Title = styled.h2`
  margin-bottom: 10px;
  text-align: center;
`

const DashboardLayout = () => {
  const { getRequest, LoadingOverlay } = useContext(RequestsContext)
  const { systemDefaults } = useContext(DefaultsContext)
  const [chartsData, setChartsData] = useState([])
  const [loading, setLoading] = useState(true)
  const { labels } = useResourceParams({ datasetId: ResourceIds.UserDashboard })
  const debouncedCloseLoading = debounce(() => setLoading(false), 200)

  const fetchData = async () => {
    setLoading(true)
    const rootResponse = await getRequest({ extension: DeliveryRepository.GenerateTrip.root })

    const volumeRequests = rootResponse.list.map(async zone => {
      const response = await getRequest({
        extension: DeliveryRepository.Volume.vol,
        parameters: `_parentId=${zone.recordId}`
      })

      return {
        zoneName: zone.zoneName,
        volumes:
          response?.record?.saleZoneOrderVolumeSummaries?.map(summary => {
            return {
              subZone: summary.zoneName ?? '',
              volume: summary.volume
            }
          }) ?? []
      }
    })

    const allChartsData = await Promise.all(volumeRequests)
    const minZoneVolumeDBObj = systemDefaults?.list?.find(item => item.key === 'minZoneVolumeDB')

    const minZoneVolumeDB =
      minZoneVolumeDBObj && minZoneVolumeDBObj.value !== undefined
        ? Number(minZoneVolumeDBObj.value) || Infinity
        : Infinity

    const filteredChartsData = allChartsData.map((chart, index) => ({
      zoneName: rootResponse.list[index]?.name ?? 'Unknown Zone',
      volumes: chart.volumes.filter(v => v.subZone).slice(0, minZoneVolumeDB)
    }))

    setChartsData(filteredChartsData)
    debouncedCloseLoading()
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 300000)

    return () => clearInterval(interval)
  }, [systemDefaults])

  if (loading) return <LoadingOverlay />

  return (
    <Frame>
      <Container>
        {chartsData.map((chart, index) => (
          <ChartCard key={index}>
            <Title>
              {labels.deliveryVolumes} - {chart.zoneName}
            </Title>
            <HorizontalBarChartDark
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
