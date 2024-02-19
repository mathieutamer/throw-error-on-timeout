# throw-error-on-timeout
Throw an error (and allow to stop flow) if an async function takes more than a set duration

### Usage

Constructor defines a timeout in milliseconds.
```javascript
const ThrowErrorOnTimeout = require('throw-error-on-timeout');

const timeoutError = new ThrowErrorOnTimeout(1000);
```

Method `raceWithTimeout` executes the async function, that acts in the exact same way as
the original function, but throw an error if the race agains timeout is lost.

```javascript
try {
  const globalResult = await timeoutError.raceWithTimeout(async () => {
    //
    // Put your async function(s) here
    //
    // Any value return here will be returned by
    // the "raceWithTimeout" function (in case of success)
  });
} catch(err) {
  // "err" will be "Async function timeout", if global async function time-outs
  // or the error thrown by the function otherwise.
}
```

Method `checkExpiration` allows to stop flow if the global function has already time-outed.

```javascript
try {
  const globalResult = await timeoutError.raceWithTimeout(async () => {
    await oneAsyncFunction();

    timeoutError.checkExpiration();

    // Will be executed only if global function has not time-outed yet
    // at the time of the "checkExpiration", the line before
    await anotherAsyncFunction();
  });
} catch(err) {
  // "err" will still be "Async function timeout", if global async function time-outs
}
```

### Lambda use case

This package was initially created in order to handle lambda timeout. Lambda provides a `getRemainingTimeInMillis` method in the `context` object that gives the remaining time before lambda timeout.
So calling the constructor with that function allows to anticipate lambda timeout:

```javascript
const promiseTimeout = new PromiseChainTimeoutRejection(context.getRemainingTimeInMillis() - 500);
```

### Re-writing of old "promise-chain-timeout-rejection" package

This package is a re-writing of the  "promise-chain-timeout-rejection" [package](https://github.com/Precogs-com/promise-chain-timeout-rejection) adapted to async/await functions.
