import request, { request as http } from '@/utils/request'

//审批列表
export function getApprovalList(data: Object) {
  return request({
    url: '/admin/myApproval/list',
    method: 'POST',
    data: data
  })
}
//审批详情
export function getApprovalDetail(data: Object) {
  return request({
    url: '/risk/approval/getDetail',
    method: 'POST',
    data: data
  })
}
//风控审批
export function doneApproval(data: Object) {
  return request({
    url: '/risk/approval/doneApproval',
    method: 'POST',
    data: data
  })
}
//受理审批-财务
export function approvalFinancing(data: Object) {
  return request({
    url: '/acceptApproval/approvalFinancing',
    method: 'POST',
    data: data
  })
}
//受理审批-用章
export function approvalSign(data: Object) {
  return request({
    url: '/acceptApproval/sign',
    method: 'POST',
    data: data
  })
}
