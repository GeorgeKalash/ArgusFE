import { SystemRepository } from 'src/repositories/SystemRepository'

const reference = async (getRequest, endpointId, param) => {
  let parameters = '_key=' + param

  try {
    const res1 = await getRequest({
      extension: endpointId,
      parameters
    })

    if (res1?.record?.value) {
      const value = res1.record.value
      parameters = '_recordId=' + value

      const res2 = await getRequest({
        extension: SystemRepository.NumberRange.get,
        parameters
      })

      if (res2 && !res2.record.external) {
        return { readOnly: true, mandatory: false }
      }
    }
  } catch (error) {
    return { readOnly: false, mandatory: true, error }
  }

  return { readOnly: false, mandatory: true }
}

export { reference }
