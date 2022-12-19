export function disableWarning() {
    const origWarning = process.emitWarning;
    process.emitWarning = (...args: any) => {
        if (args[2] !== 'DEP0005') {
            // pass any other warnings through normally
            return origWarning.apply(process, args);
        } else {
            // do nothing, eat the warning
        }
    }
}
