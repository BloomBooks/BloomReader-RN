/**
 * Useful for when multiple callers want the result to a single
 * asynchronous function.
 *
 * The constructor argument sets async function to be run, but does not start it.
 * The first call to getPromise kicks off the async function, and returns
 * a promise that will be resolved/rejected according to the result of the async function.
 * Any calls to getPromise that come in while the async function is running will
 * also be resolved/rejected according to the result of the async function.
 * Once the async function returns, the singleton is reset.
 */

export default class SingletonPromise<T> {
  private mainPromise: Promise<T> | null = null;
  private asyncFn: () => Promise<T>;
  private resolveCallbacks: Array<(t: T) => void> = [];
  private rejectCallbacks: Array<(err: any) => void> = [];

  constructor(asyncFn: () => Promise<T>) {
    this.asyncFn = asyncFn;
  }

  private reset() {
    this.mainPromise = null;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];
  }

  public getPromise(): Promise<T> {
    return new Promise((resolve, reject) => {
      this.resolveCallbacks.push(resolve);
      this.rejectCallbacks.push(reject);
      if (this.mainPromise == null) {
        this.mainPromise = this.asyncFn();
        this.mainPromise
          .then(value => {
            this.resolveCallbacks.forEach(cb => cb(value));
            this.reset();
          })
          .catch(err => {
            this.rejectCallbacks.forEach(cb => cb(err));
            this.reset();
          });
      }
    });
  }
}
