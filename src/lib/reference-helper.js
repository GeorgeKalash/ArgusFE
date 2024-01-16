const reference = (endpointId , param) => {

  let parameters = '_key=' + param;

  getRequest({
    extension: endpointId,
    parameters,
  })
    .then((res) => {
      if (res.record.value) {
        const value = res?.record?.value;
        parameters = '_recordId=' + value;

        return getRequest({
          extension: SystemRepository.NumberRange.get,
          parameters,
        });
      }
    })
    .then((res) => {
      if (res && !res.record.external) {
      return { enabled: true, mandatory: false };

      }
    })
    .catch((error) => {
      setErrorMessage(error);
    });

    return { enabled: false, mandatory: true };

}


export {reference};
