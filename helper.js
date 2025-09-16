const time = () => new Date().toTimeString().substring(0, 8)
function delay(timeout, isOk = true) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            isOk ? resolve() : reject()
        }, timeout)
    })
}

export {delay, time}