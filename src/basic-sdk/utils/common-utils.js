export const isMac = () => {
  const platform = navigator.platform;
  return (platform === 'Mac68K') || (platform === 'MacPPC') || (platform === 'Macintosh') || (platform === 'MacIntel');
};

export const getErrorMsg = (error) => {
  let errorMsg = '';
  if (error.response) {
    if (error.response.status === 403) {
      errorMsg = 'Permission_denied';
    } else if (error.response.data &&
      error.response.data['error_msg']) {
      errorMsg = error.response.data['error_msg'];
    } else {
      errorMsg = 'Error';
    }
  } else {
    errorMsg = 'Please_check_the_network';
  }
  return errorMsg;
};
