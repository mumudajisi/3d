export class EventBus {
    constructor() {
        this.eventObject = {}
        this.callbackId = 0
    }
    // 发布
    emit(eventName, ...args) {
        // 当前事件的所有回调函数
        const callbackObject = this.eventObject[eventName]
        if (!callbackObject) return console.warn(eventName + "Not Found")
        for (const id in callbackObject) {
            callbackObject[id](...args) // 执行每一个回调函数
        }
    }
    on(eventName, callback) {
        // 初始化
        if (!this.eventObject[eventName]) {
            this.eventObject[eventName] = {}
        }
        const id = this.callbackId++
        this.eventObject[eventName][id] = callback
        const off = () => {
            delete this.eventObject[eventName][id]
            if (Object.keys(this.eventObject[eventName]).length === 0) {
                delete this.eventObject[eventName]
            }
        }
        return { off }
    }
}
