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
      timeoutError = new ThrowErrorOnTimeout(400);
    });

    test('should succeed with async function return value', async () => {
      const testedValue = 'test value';
      const result = await timeoutError.raceWithTimeout(async () => {
        await wait(200);
        return testedValue;
      });
      expect(result).toBe('test value');
    });

    test('should fail with async function error', async () => {
      const errorMessage = 'test error';
      try {
        await timeoutError.raceWithTimeout(async () => {
          await wait(200);
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
          await wait(600);
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
          await wait(600);
          throw new Error(errorMessage);
        });

      } catch (err) {
        expect(err.message).toBe('Async function timeout');
        return;
      }
      throw new Error('Should have thrown an error');
    });
  });
});
