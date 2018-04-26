const wrapper = { "Window": /* istanbul ignore next */ function () { return; } }["Window"] as Object as typeof Window;

wrapper.prototype = window;
wrapper.prototype.constructor = wrapper;

const windowWrapper = wrapper.prototype;

export default windowWrapper;