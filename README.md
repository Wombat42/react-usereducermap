# react-usereducermap

A `React.useReducer` replacement that maps one or more handler functions to an action.

## Example

```js
import React from 'react';
import { useReducerMap } from 'react-usereducermap';

export default function HelloWorld() {
  const [state, dispatch] = useReducerMap(
    {
      a: (state, data, meta) => {
        return { hey: 'I got called' };
      },
    },
    {}
  );

  return (
    <div className="App">
      <h1
        onClick={(evt) => {
          dispatch({ type: 'a', data: 'this is some data' });
        }}
      >
        Hello react-usereducermap
      </h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```

## Install

`npm i react-usereducermap`

## Import

```js
import { useReducerMap } from 'react-usereducermap';
```

## Construction

```js
const [state, dispatch] = useReducerMap(actionMap, initialState);
```

## Dispatching

The dispatch function is the same one returned from useReducer.

The dispatched object must have a `type` property that will be mapped to the action handler. Objects missing a `type` will throw an error indicating that no handler was mapped to the action. _Warning: I may add validation on the type later to provide a more specific error message._

### ActionMap

An object where the keys are actions that are dispatched through the reducer and values that are the handlers.

```js
function actionHandler(state, data, meta) {
    // does something
    // returns the modifications to the state
    return { newStateVal: "Hey hey!!" };
}

function anotherActionHandler(state, data, meta) {
    // does something
    // returns the modifications to the state
    return { newStateVal: "Hey hey!!" };
}

const actionMap = {
    // Single action handler
    OnClick: actionHandler,
    // multiple action handlers, executed sequentially
    OtherClick: [actionHandler, anotherActionHandler],
    // multiple action handlers with helper data and functions.
    // Helpers are added to the handler's meta object as they are named. Don't overwrite dispatch or type.
    yetAnotherClick: [actionHandler, [anotherActionHandler, { someData: 'extra data', otherFunction: ()=>{}}]],
    // Called on all events before action handlers
    pre: (state, data, meta) => {},
    // Called on all events after action handlers have executed
    post: (state, data, meta) => {},
}

const [state, dispatch] = useReducerMap(actionMap, {});
dispatch({type: 'OnClick', ignoredData: "I'm not being used"})

console.log(JSON.stringify(state, null, 2))
/* Results:
{
    "newStateVal": "Hey hey!!"
}
```

### ActionHandler

```js
function actionHandler(state, data, meta) {
  // does something
  // returns the modifications to the state
}
```

- _state_: The reducer's current state object.
- _data_: The remaining attributes of the dispatch.
- _meta_: An object containing the original action type, dispatch function for the reducer, and extra _helpers_.

```js
// data example
// If dispatch were called like this:
dispatch({ type: 'OnClick', ignoredData: "I'm not being used" });
// Then data will contain
{
  ignoredData: "I'm not being used";
}
```

```js
// meta example
// If dispatch were called like this:

dispatch({type: 'OnClick', ignoredData: "I'm not being used"})
// Then meta will contain this:
{
    type: 'OnClick',
    dispatch: dispatch // original dispatch function
}
```

The function returns a state that **shallow** merges into the original state.

You can dispatch from an action handler. You can cause infinite loops, so watch out!

### Reserved Action Handlers

- _pre_: Executed before all other action handlers.
  - Only one _pre_ handler and must be a function
  - Can modify state
  - meta object does not contain the dispatch function.
  - Dispatching an object like `{type: 'pre'}` will throw an exception.
- _post_: Executed after all other action handlers.
  - Only one _post_ handler and must be a function
  - Can modify state
  - meta object does not contain the dispatch function.
  - Dispatching an object like `{type: 'post'}` will throw an exception.
- _patterns_: **Not implemented yet**
  - Maps a _regex_ to a set of action handlers
  - Evaluated after explicit action handlers
  - Good for handling events with a common prefix. Like if all your API callers will prefix an error action like `{type: 'ERROR_API_GETHOST'}` and `{type: 'ERROR_API_GETUGLYPHOTO'}`, then you can have a regex like `/^ERROR/` and handle the API errors in a common way rather than in an explicitly named action handler for each.
  - Throws a `TypeError` if you try to use it.
- Dispatching an object like `{type: 'patterns'}` will throw an exception.
