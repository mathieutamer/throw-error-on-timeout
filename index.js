class ThrowErrorOnTimeout {
  /**
   * @param   {Number} duration  Duration of the timeout
   * @return  {ThrowErrorOnTimeout}
   */
  constructor(duration) {
    this.duration = duration;
    this.expired = false;
  }

  /**
   * Race async function with timeout
   *
   * @param   {Function} asyncFunc Async function racing against timeout
   * @return  {Any}
   */
  raceWithTimeout(asyncFunc) {
    let timeout;
    // Create a race between a timeout and the param async function
    return Promise.race([
      // Promise that rejects after a set duration
      new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          this.expired = true;
          return reject(new Error('Async function timeout'));
        }, this.duration);
      }),
      // Encapsulate promise in async/await IIFE,
      // in order to clear timeout when async function is fulfilled
      (async () => {
        try {
          const result = await asyncFunc();
          return result;
        } finally {
          clearTimeout(timeout);
        }
      })(),
    ]);
  }

  /**
   * Throws an error if timeout has already expired
   * @return  {Void}
   */
  checkExpiration() {
    if (this.expired) {
      throw new Error('Global async function has already expired');
    }
  }
}

module.exports = ThrowErrorOnTimeout;
