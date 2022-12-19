"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableWarning = void 0;
function disableWarning() {
    const origWarning = process.emitWarning;
    process.emitWarning = (...args) => {
        if (args[2] !== 'DEP0005') {
            // pass any other warnings through normally
            return origWarning.apply(process, args);
        }
        else {
            // do nothing, eat the warning
        }
    };
}
exports.disableWarning = disableWarning;
