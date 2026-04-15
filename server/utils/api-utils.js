/**
 * 带有指数退避机制的 API 请求包裹函数
 * @param {Function} apiCallFunc - 需要执行的异步 API 请求函数
 * @param {number} maxRetries - 最大重试次数 (默认 5 次)
 * @param {number} baseDelay - 初始基础等待时间，单位毫秒 (默认 1000ms = 1秒)
 * @returns {Promise<any>}
 */
async function callModelWithRetry(apiCallFunc, maxRetries = 5, baseDelay = 1000) {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            // 尝试执行你的原始大模型调用逻辑
            const response = await apiCallFunc();
            return response; // 如果成功，直接返回结果，跳出循环

        } catch (error) {
            // 解析错误，判断是否为 503 或者 MODEL_CAPACITY_EXHAUSTED
            const isCapacityError =
                error.status === 503 ||
                (error.response && error.response.status === 503) ||
                (error.message && error.message.includes('MODEL_CAPACITY_EXHAUSTED'));

            // 如果是容量耗尽错误，并且还没达到最大重试次数
            if (isCapacityError && retries < maxRetries - 1) {
                // 计算退避时间：基础时间 * 2的n次方 + 随机抖动(0~1秒)
                const jitter = Math.random() * 1000;
                const delay = (baseDelay * Math.pow(2, retries)) + jitter;

                console.warn(`[API 拥堵拦截] 检测到 503 容量耗尽。${(delay / 1000).toFixed(1)} 秒后进行第 ${retries + 1} 次重试...`);

                // 暂停程序执行，等待计算出的时间
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
            } else {
                // 如果不是 503 错误（比如 400 参数错误，401 密钥失效），或者重试次数用光了，就直接把错误抛出，停止重试
                console.error(`[API 请求失败] 无法恢复的错误或已达到最大重试次数。`);
                throw error;
            }
        }
    }
}

// 导出这个工具函数
export { callModelWithRetry };