const windowWrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"];

windowWrapper.prototype = window;
windowWrapper.prototype.constructor = windowWrapper;

const instance = windowWrapper.prototype;

export default instance;