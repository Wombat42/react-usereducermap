import React from 'react';

function getNoActionError(actionType) {
  return new Error(`No action handler for type: ${actionType}`);
}

function getHandlerTypeError(actionHandler) {
  return new TypeError(`Handler is an invalid type: ${typeof actionHandler}`);
}

function handleAction(actionHandler, state, data, meta) {
  const type = typeof actionHandler;
  if (type === 'function') {
    return actionHandler(state, data, meta);
  } else if (type !== 'undefined') {
    throw getHandlerTypeError(actionHandler);
  }
  throw getNoActionError(meta.type);
}

function callHandlerTuple(handler, state, data, meta) {
  let [h, helpers] = handler;
  if (typeof h !== 'function') {
    throw getHandlerTypeError(h);
  } else if (!helpers || typeof helpers !== 'object') {
    throw new TypeError(`Helper object is an invalid type: ${typeof helpers}`);
  }
  return { ...state, ...handleAction(h, state, data, { ...meta, helpers }) };
}

function callLastHandler(stack, state, data, meta) {
  if (stack.length > 0) {
    const lastHandler = stack.pop();
    return {
      ...state,
      ...lastHandler(state, data, meta),
    };
  }
  return state;
}

export function useReducerMap(actionMap, initialValue) {
  if (!actionMap) {
    throw new TypeError('ActionMap is not defined');
  }
  // Should add a validation of the actionMap instead or checking at run time.
  const ref = React.useRef();
  function mappingFunction(state, action) {
    let newState = { ...state };
    const { type, ...data } = action;
    const actionHandler = actionMap[type];
    const actionHandlerType = typeof actionHandler;
    let meta = { type };

    // pre-handler: Lets you look at the reducer for all events.
    // Executes prior to a named event handler
    if (actionMap.pre) {
      newState = { ...newState, ...actionMap.pre(newState, data, meta) };
    }
    meta = { ...meta, dispatch: ref.current };
    // You can have more than one handler for an action type;
    if (Array.isArray(actionHandler)) {
      const handlerStack = [];
      if (actionHandler.length === 0) {
        throw getNoActionError(type);
      }
      for (let index = 0; index < actionHandler.length; index++) {
        let tempHandler = actionHandler[index];
        let tempHandlerType = typeof tempHandler;
        if (tempHandlerType === 'function') {
          newState = callLastHandler(handlerStack, newState, data, meta);
          handlerStack.push(tempHandler);
        } else if (Array.isArray(tempHandler)) {
          newState = callLastHandler(handlerStack, newState, data, meta);
          newState = callHandlerTuple(tempHandler, newState, data, meta);
        } else if (tempHandlerType === 'object' && tempHandler) {
          const lastFunction = handlerStack.pop();
          if (!lastFunction) {
            throw getHandlerTypeError(tempHandler);
          }
          newState = callHandlerTuple([lastFunction, tempHandler], newState, data, meta);
        } else if (tempHandlerType !== 'undefined') {
          throw getHandlerTypeError(tempHandler);
        } else {
          throw getNoActionError(type);
        }
      }
      newState = callLastHandler(handlerStack, newState, meta);
    } else if (actionHandlerType === 'function') {
      // standalone function call
      newState = {
        ...newState,
        ...actionHandler(newState, data, meta),
      };
    } else if (actionHandlerType !== 'undefined') {
      throw getHandlerTypeError(actionHandler);
    } else {
      throw getNoActionError(type);
    }

    // post-handler: Executes after all the other handlers
    if (actionMap.post) {
      let { dispatch, ...newMeta } = meta;
      newState = { ...newState, ...actionMap.post(newState, data, newMeta) };
    }
    return newState;
  }
  const [state, dispatcher] = React.useReducer(mappingFunction, initialValue);
  ref.current = dispatcher;
  return [state, dispatcher];
}
