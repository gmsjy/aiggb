/**
 * 单轮运行的生命周期控制：AbortController + 取消监听器
 *
 * - ChatPanel 在 runRound 起点调用 beginRun 获取 signal，传给 chat/chatRaw，
 *   Toolbar「清空 / 切换 2D↔3D」时调用 abortCurrentRun 取消进行中的请求。
 * - spec-review 等待气泡通过 onRunCancelled 在取消时同步释放并发锁，
 *   避免「清空后气泡消失、锁却永远不释放」的悬挂状态。
 * - endRun 在 runRound 的 finally 中调用，复位本轮状态。
 */

let controller: AbortController | null = null;
let aborted = false;
const cancelListeners = new Set<() => void>();

/** 开始一轮 run：取消上一轮残留请求并返回新的 signal */
export function beginRun(): AbortSignal {
  cancel();
  aborted = false;
  controller = new AbortController();
  return controller.signal;
}

/** 订阅本轮被取消（清空/切模式）的事件。返回退订函数。 */
export function onRunCancelled(cb: () => void): () => void {
  cancelListeners.add(cb);
  return () => {
    cancelListeners.delete(cb);
  };
}

/** 取消本轮：abort 进行中请求 + 通知所有取消监听器 */
export function abortCurrentRun(): void {
  cancel();
}

/** 本轮是否已被取消（供 catch 里静默吞掉 AbortError） */
export function wasAborted(): boolean {
  return aborted;
}

/** 本轮结束（无论成败）后清理引用 */
export function endRun(): void {
  controller = null;
  cancelListeners.clear();
  aborted = false;
}

function cancel(): void {
  controller?.abort();
  aborted = true;
  const cbs = [...cancelListeners];
  cancelListeners.clear();
  for (const cb of cbs) cb();
}
