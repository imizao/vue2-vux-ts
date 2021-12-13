import { localStore } from '@/utils/data-management'
import { AxiosResponseForZCT, ZCTAPI } from '@/utils/types'
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
// import md5 from 'js-md5'
import StringUtils from './stringUtils'

// AxiosError 只有 message， 接口返回 msg， 故此扩展一下
interface customError extends AxiosError {
  msg: string
}

const service: AxiosInstance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 10000,
  withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStore.get('token')
    // config.headers['key-token'] = key_token
    const timestamp = new Date().getTime() + ''
    const nonce = StringUtils.randomStr(32)
    const SECRET = 'xxxxxxxxxx'
    const encrptString = `${timestamp}.${SECRET}.${nonce}`
    // const sign = md5(encrptString)
    const sign = encrptString
    config.headers = {
      ...config.headers, //@temp
      sign,
      timestamp,
      nonce,
      token: token
    }
    return config
  },
  (error: AxiosError) => {
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse<ZCTAPI.Res>) => {
    /**
     * TODO: 补充服务端状态码规范
     */
    if (response.data.code === 1000 || response.data.code === 0) {
      return response
    } else {
      // Message.error(response.data.message || '网络错误')
      return Promise.reject(response)
    }
  },
  (error: customError) => {
    const { data } = error.response as any
    const res = data as AxiosResponseForZCT
    // Message({
    //   message: error.msg || res.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    return Promise.reject(error)
  }
)

export default service
export function request<T>(params: object): Promise<T> {
  return service(params) as any
}
