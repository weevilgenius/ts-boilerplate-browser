
class ResizeObserverStub implements ResizeObserver {
  private callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {
    // no-op for tests
  }

  observe(): void {
    // no-op for tests
  }

  unobserve(): void {
    // no-op for tests
  }

  takeRecords(): ResizeObserverEntry[] {
    return [];
  }
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub;
}

// happy-dom does not implement the ElementInternals API. Web Awesome form
// controls (e.g. wa-button) read `internals.validity` during their Lit update,
// which throws (an unhandled rejection) when attachInternals is missing. Provide
// a minimal stub so form-associated components render in tests.
if (typeof HTMLElement.prototype.attachInternals !== 'function') {
  HTMLElement.prototype.attachInternals = function attachInternals(): ElementInternals {
    return {
      validity: {} as ValidityState,
      validationMessage: '',
      willValidate: false,
      form: null,
      labels: [] as unknown as NodeList,
      states: new Set<string>() as unknown as CustomStateSet,
      shadowRoot: null,
      checkValidity: () => true,
      reportValidity: () => true,
      setValidity: () => undefined,
      setFormValue: () => undefined,
    } as unknown as ElementInternals;
  };
}
