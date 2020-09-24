import { renderHook } from "@testing-library/react-hooks";
import { useReducerMap } from "../src/reducermap";

describe("Initialization tests", () => {
  it("Should throw an exception if actionmap is null", () => {
    expect(() => useReducerMap()).toThrowError("ActionMap is not defined");
  });

  it("Should return a state object and dispatcher, without setting inital state", () => {
    const { result } = renderHook(() => useReducerMap({}));
    const [state, dispatcher] = result.current;
    expect(state).toBeUndefined();
    expect(dispatcher).toBeInstanceOf(Function);
  });

  it("Should create with an empty map and empty init state", () => {
    const { result } = renderHook(() => useReducerMap({}, {}));
    const [state, dispatcher] = result.current;
    expect(state).toMatchObject({});
    expect(dispatcher).toBeInstanceOf(Function);
  });

  it("Should create with a single action type handler and empty init state", () => {
    const initObj = { a: "hi" };
    const { result } = renderHook(() =>
      useReducerMap({ a: () => {} }, initObj)
    );
    const [state, dispatcher] = result.current;
    expect(state).toMatchObject(initObj);
    expect(dispatcher).toBeInstanceOf(Function);
  });
});
