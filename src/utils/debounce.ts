// 0.基本功能
// 1.立即执行（在每一次开始的时候先立即执行一次）
// 2.取消按钮
// 3.获取返回值
export default function _debounce<T>(
  listenFn: (this: T) => void,
  delay: number,
  immediate = false
) {
  if (typeof listenFn !== 'function' || typeof delay !== 'number' || typeof immediate !== 'boolean')
    throw new Error('arguments error')
  let timer: number | undefined
  let isInvoke = true
  function debounce(this: T, ...args: any) {
    if (immediate && isInvoke) {
      listenFn.apply(this as T, args)
      isInvoke = false
      return
    }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      listenFn.apply(this as T, args)
      timer = undefined
      isInvoke = true
    }, delay)
  }
  debounce.cancel = function () {
    clearTimeout(timer)
    timer = undefined
    isInvoke = true
  }
  return debounce
}
