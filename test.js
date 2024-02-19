const ThrowErrorOnTimeout = require('./index');

// Sugar syntax for wait in order to simplify tests
const wait = async (time) => new Promise(resolve => {
  setTimeout(() => resolve(), time);
});

describe('ThrowErrorOnTimeout', () => {
  describe('constructor', () => {
    test('should succeed', () => {
      const timeoutError = new ThrowErrorOnTimeout(1000);
      expect(timeoutError).toBeInstanceOf(ThrowErrorOnTimeout);
      expect(timeoutError).toEqual({
        duration: 1000,
        expired: false,
      });
    });
  });

  describe('raceWithTimeout', () => {
    let timeoutError;

    beforeEach(() => {
      timeoutError = new ThrowErrorOnTimeout(200);
    });

    test('should succeed with async function return value', async () => {
      const testedValue = 'test value';
      const result = await timeoutError.raceWithTimeout(async () => {
        await wait(100);
        return testedValue;
      });
      expect(result).toBe('test value');
    });

    test('should fail with async function error', async () => {
      const errorMessage = 'test error';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(100);
          throw new Error(errorMessage);
        });

      } catch (err) {
        expect(err.message).toBe('test error');
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('should fail with timeout error, even if async function return a value', async () => {
      const testedValue = 'test value';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(300);
          return testedValue;
        });

      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('should fail with timeout error, even if async function throws an error', async () => {
      const errorMessage = 'test error';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(300);
          throw new Error(errorMessage);
        });

      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        return;
      }
      throw new Error('Should have thrown an error');
    });
  });

  describe('checkExpiration', () => {
    let spy;
    let timeoutError;

    beforeEach(() => {
      spy = jest.fn();
      timeoutError = new ThrowErrorOnTimeout(200);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should continue if checkExpiration is not used', async () => {
      const testedValue = 'test value ter';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(300);
          spy(); // spy will be called even if function timeout...
          // because "checkExpiration" is not used
          return testedValue;
        });
      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        // At first spy is not called
        expect(spy.mock.calls.length).toBe(0);
        // But if we wait in order to let a chance to be called
        await wait(200);
        // Eventually, the spy will be called...
        expect(spy.mock.calls.length).toBe(1);
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('should continue if not expired', async () => {
      const testedValue = 'test value bis';
      const result = await timeoutError.raceWithTimeout(async () => {
        await wait(100);
        timeoutError.checkExpiration();
        spy(); // spy will be called because function will not timeout
        return testedValue;
      });
      expect(result).toBe('test value bis');
      expect(spy.mock.calls.length).toBe(1);
    });

    test('should stop flow if expired', async () => {
      const testedValue = 'test value ter';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(300);
          timeoutError.checkExpiration();
          spy();  // spy will not be called because function will timeout
          // and flow is stopped by "checkExpiration" function
          return testedValue;
        });
      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        // First wait to let a chance to the spy to be called
        await wait(200);
        // Spy is still not called
        expect(spy.mock.calls.length).toBe(0);
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('should stop flow if expired (with multiple functions)', async () => {
      const testedValue = 'test value ter';
      try {
        await timeoutError.raceWithTimeout(async () => {
          // Repeat 2 times, but should top after firts time
          await wait(100);
          timeoutError.checkExpiration();
          spy(); // spy will be called because function has not timeout yet
          await wait(200);
          timeoutError.checkExpiration();
          spy(); // spy will not be called because function will timeout
          // and flow is stopped by "checkExpiration" function
          return testedValue;
        });
      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        // First wait to let a chance to the second spy to be called
        await wait(200);
        // Spy is still called once
        expect(spy.mock.calls.length).toBe(1);
        return;
      }
      throw new Error('Should have thrown an error');
    });
  });
});
