import { renderHook, act } from '@testing-library/react-hooks';
import { useReducerMap } from '../src/usereducermap';

describe('Valid map configurations', () => {
  function runCommon(result, expectedState) {
    const [, dispatch] = result.current;
    act(() => {
      dispatch({ type: 'a', data: 'This is a string' });
    });
    expect(result.current[0]).toStrictEqual(expectedState);
  }

  it.each`
    actionHandler                                                                  | expectedState
    ${() => ({ attr: 'hi' })}                                                      | ${{ attr: 'hi' }}
    ${[() => ({ attr2: 'hi2' })]}                                                  | ${{ attr2: 'hi2' }}
    ${[() => ({ attr2: 'hi2' }), () => ({ attr3: 'hi3' })]}                        | ${{ attr2: 'hi2', attr3: 'hi3' }}
    ${(state, data) => ({ attr: 'hi', sData: data.data })}                         | ${{ attr: 'hi', sData: 'This is a string' }}
    ${(state, data, meta) => ({ attr: 'hi', sData: data.data, sMeta: meta.type })} | ${{ attr: 'hi', sData: 'This is a string', sMeta: 'a' }}
  `('Should handle basic update of state', ({ actionHandler, expectedState }) => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: actionHandler,
        },
        {}
      );
    });
    runCommon(result, expectedState);
  });

  it('Should set state in first call, be able to read it in next handler and change the object', () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: [
            (state, data) => ({ attr2: 'hi2', sData: data.data }),
            (state) => ({ attr3: 'hi3', length: state.sData.length }),
          ],
        },
        {}
      );
    });
    runCommon(result, {
      attr2: 'hi2',
      attr3: 'hi3',
      sData: 'This is a string',
      length: 16,
    });
  });

  it('Should set state in first call, be able to read it in next handler and change the same attribute', () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: [
            (state, data) => ({ attr2: 'hi2', sData: data.data }),
            (state) => ({ attr3: 'hi3', sData: state.sData.length }),
          ],
        },
        {}
      );
    });
    runCommon(result, {
      attr2: 'hi2',
      attr3: 'hi3',
      sData: 16,
    });
  });

  it('Check meta object for type', () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: (state, data, meta) => ({ mType: meta.type }),
        },
        {}
      );
    });
    runCommon(result, {
      mType: 'a',
    });
  });

  it('Dispatch an event from an action', () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          a: (state, data, meta) => {
            const dispatch = meta.dispatch;
            dispatch({
              type: 'b',
              data: 'some data',
              otherData: 'some other data',
            });
            return { a: 'called' };
          },
          b: (state, data) => {
            return { dataData: data.data, theOtherData: data.otherData };
          },
        },
        {}
      );
    });

    runCommon(result, {
      a: 'called',
      dataData: 'some data',
      theOtherData: 'some other data',
    });
  });

  it('Should call pre and post on each event', () => {
    const { result } = renderHook(() => {
      return useReducerMap(
        {
          pre: (state, data, meta) => {
            // dispatch function must not be in a pre or it will cause an infinite loop
            expect(data).toBeDefined();
            expect(meta.dispatch).toBeUndefined();
            return { preCallCounter: state.preCallCounter + 1 || 1 };
          },
          post: (state, data, meta) => {
            // dispatch function must not be in a post or it will cause an infinite loop
            expect(data).toBeDefined();
            expect(meta.dispatch).toBeUndefined();
            return { postCallCounter: state.postCallCounter + 1 || 1 };
          },
          a: (state, data, meta) => {
            // You can dispatch from here, but now you can cause a infinite loop
            expect(meta.dispatch).toBeInstanceOf(Function);
            return { a: 'called' };
          },
          b: (state, data, meta) => {
            expect(meta.dispatch).toBeInstanceOf(Function);
            return { b: 'called' };
          },
        },
        {}
      );
    });
    act(() => {
      const [, dispatch] = result.current;
      dispatch({ type: 'a' });
      dispatch({ type: 'b', someData: 'hey' });
    });

    expect(result.current[0]).toStrictEqual({
      a: 'called',
      b: 'called',
      preCallCounter: 2,
      postCallCounter: 2,
    });
  });
});
