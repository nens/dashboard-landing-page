export function addGetParameter(url, key, value) {
  const k = encodeURIComponent(key);
  const v = encodeURIComponent(value);

  if (url.indexOf('?') === -1) {
    return `${url}?${k}=${v}`;
  } else {
    return `${url}&${k}=${v}`;
  }
}