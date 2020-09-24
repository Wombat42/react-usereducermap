import { renderHook, act } from "@testing-library/react-hooks";
import { useReducerMap } from "../src/reducermap";

describe("Single Action Tests, no exception conditions", () => {
  function runCommon(result, expectedValues) {
    let expectedIndex = 0;
    const [, dispatch] = result.current;
    act(() => {
      dispatch({ type: "a" });
    });
    expect(result.current[0]).toMatchObject(expectedValues[expectedIndex++]);

    act(() => {
      for (let i = 0; i < 3; i++) {
        dispatch({ type: "a" });
      }
    });
    expect(result.current[0]).toMatchObject(expectedValues[expectedIndex++]);
  }

  it("Should update state for a simple 1 event with 1 action handler", () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: (state) => {
            return { aResult: state.aResult ? state.aResult + 1 : 1 };
          }
        },
        {}
      );
    });
    runCommon(result, [{ aResult: 1 }, { aResult: 4 }]);
  });

  it("Should update state for a simple 1 event with 1 action handler in array", () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: [
            (state) => {
              return { aResult: state.aResult ? state.aResult + 1 : 1 };
            }
          ]
        },
        {}
      );
    });
    runCommon(result, [{ aResult: 1 }, { aResult: 4 }]);
  });

  it("Should update state for a simple 1 event with 2 action handlers in array", () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: [
            (state) => {
              return { aResult: state.aResult ? state.aResult + 1 : 1 };
            },
            (state) => {
              return { aResult2: state.aResult2 ? state.aResult2 + 1 : 1 };
            }
          ]
        },
        {}
      );
    });
    runCommon(result, [
      { aResult: 1, aResult2: 1 },
      { aResult: 4, aResult2: 4 }
    ]);
  });

  it("Should update state for a simple 1 event with 2 action handlers in array, modifying same state val", () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: [
            (state) => {
              return { aResult: state.aResult ? state.aResult + 1 : 1 };
            },
            (state) => {
              return { aResult: state.aResult ? state.aResult + 1 : 1 };
            }
          ]
        },
        {}
      );
    });
    runCommon(result, [{ aResult: 2 }, { aResult: 8 }]);
  });
});