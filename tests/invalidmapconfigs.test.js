import { renderHook, act } from "@testing-library/react-hooks";
import { useReducerMap } from "../src/reducermap";

describe("Invalid map configurations and other errors", () => {
  function runCommon(result, errMsg, type) {
    const [, dispatch] = result.current;
    act(() => {
      dispatch({ type: "a" });
    });

    let errorMessage = errMsg + type;
    expect(result.error.message).toMatch(errorMessage);
  }

  it.each`
    actionType             | type
    ${[null]}              | ${"object"}
    ${null}                | ${"object"}
    ${true}                | ${"boolean"}
    ${false}               | ${"boolean"}
    ${9}                   | ${"number"}
    ${""}                  | ${"string"}
    ${{}}                  | ${"object"}
    ${[9]}                 | ${"number"}
    ${[""]}                | ${"string"}
    ${[{}]}                | ${"object"}
    ${[() => {}, 9]}       | ${"number"}
    ${[() => {}, ""]}      | ${"string"}
    ${[() => {}, [""]]}    | ${"string"}
    ${[() => {}, [null]]}  | ${"object"}
    ${[() => {}, [9]]}     | ${"number"}
    ${[() => {}, [{}]]}    | ${"object"}
    ${[() => {}, [true]]}  | ${"boolean"}
    ${[() => {}, [false]]} | ${"boolean"}
  `("Fault due to invalid handler type", ({ actionType, type }) => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: actionType
        },
        {}
      );
    });
    runCommon(result, "Handler is an invalid type: ", type);
  });

  it.each`
    actionType             | type
    ${[[() => {}, ""]]}    | ${"string"}
    ${[[() => {}, null]]}  | ${"object"}
    ${[[() => {}, 9]]}     | ${"number"}
    ${[[() => {}, true]]}  | ${"boolean"}
    ${[[() => {}, false]]} | ${"boolean"}
  `("Fault due to invalid helper type", ({ actionType, type }) => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: actionType
        },
        {}
      );
    });
    runCommon(result, "Helper object is an invalid type: ", type);
  });

  it("Fault due to empty handler array", () => {
    expect.assertions(1);
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: []
        },
        {}
      );
    });
    const [, dispatch] = result.current;
    act(() => {
      dispatch({ type: "a" });
    });
    expect(result.error).toEqual(Error("No action handler for type: a"));
  });

  it("Fault by dispatching to unknown action type", () => {
    expect.assertions(1);
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: () => {}
        },
        {}
      );
    });
    const [, dispatch] = result.current;

    act(() => {
      dispatch({ type: "b" });
    });
    expect(result.error).toEqual(Error("No action handler for type: b"));
  });
});
