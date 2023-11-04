import { AxiosRequestConfig } from 'axios'
import { config } from 'process'

const instance = axios.create({
  timeout: 10000,
  baseURL: 'https://raw.githubusercontent.com/'
})

instance.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response.data
    } else {
      return Promise.reject(response)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export const requestBookMark = (url: string, params: AxiosRequestConfig) => {
  return instance.get(url, params)
}
