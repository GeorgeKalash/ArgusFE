import { ImmediateWindow } from '@argus/shared-providers/src/providers/windows'
import ServicesForm from './forms/ServicesForm'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

export default function TimeAttendanceServices() {
  const query = new URLSearchParams(window.location.search)
  const resourceId = Number(query.get('resourceId'))
  const { labels } = useResourceParams({ datasetId: resourceId })

  return <ImmediateWindow titleName={labels.title} Component={ServicesForm} />
}