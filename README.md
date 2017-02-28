# TypeScript Decorators for Vuex [![Build Status](https://img.shields.io/circleci/project/snaptopixel/vuex-ts-decorators/master.svg)](https://circleci.com/gh/snaptopixel/vuex-ts-decorators) [![npm package](https://img.shields.io/npm/v/vuex-ts-decorators.svg)](https://www.npmjs.com/package/vuex-ts-decorators)

> Write Vuex stores and modules with type-safety and code completion

## A quick primer

Decorators can seem quite magical so it helps to have a basic understanding of what they do (and don't do). In this implementation the main job of decorators is to transform a `class` _definition_ into a “shape” which Vuex supports.

So, you write a nice class with comfortable syntax and the decorators do the legwork of mapping, transforming and replacing your class with something else. They also normalize the scope in which your actions, mutations and getters operate so instead of using function params you end up just using `this` to access things in a straightforward (and type-safe) way.

## Inspiration

This solution is heavily inspired by the excellent work on [vue-class-component](https://github.com/vuejs/vue-class-component) which makes writing components in TypeScript very ergonomic and fun. The goal of this project is to apply similar patterns to Vuex while also providing (and [allowing for](#conventions-for-type-safety)) TypeScript niceties like code-completion and type-safety all the way down.

## A basic example
The following snippet shows a standard Vuex declaration followed by an example using decorators.

```ts
// Without decorators
const MyStore = new Vuex.Store({
  state: {
    prop: 'value'
  },
  getters: {
    myGetter(state, getters) {
      return state.prop + ' gotten';
    },
    myOtherGetter(state, getters) {
      return getters.myGetter + ' again';
    }
  },
  actions: {
    myAction({commit, getters}, payload) {
      commit('myMutation', getters.myOtherGetter + payload.prop);
    }
  },
  mutations: {
    myMutation(state, payload) {
      state.prop = payload;
    }
  }
})

// With decorators
@module({
  store: true
})
class MyStore {
  prop = 'value';
  get myGetter(): string {
    return this.prop + ' gotten';
  }
  get myOtherGetter(): string {
    return this.myGetter + ' again';
  }
  @action
  myAction(payload) {
    this.commit('myMutation', this.myOtherGetter + payload.prop);
  }
  @mutation
  myMutation(payload) {
    this.prop = payload;
  }
}
```

## Conventions for type-safety
You may have noticed a problem with the second example above. Inside `myAction` we're making a call to `this.commit()` which is not defined on the class and will throw an error at compile time.

It's important to note that by themselves, these decorators do not provide full type-safety for Vuex. Instead they allow you to write your stores and modules in a way that allows you to _achieve_ type-safety via normal TypeScript conventions.

### Example store with typed `dispatch` and `commit`

```ts
type actions = {
  myAction: {prop: string}
}

type mutations = {
  myMutation: string
}

type TypedDispatch = <T extends keyof actions>(type: T, value?: actions[T] ) => Promise<any[]>;
type TypedCommit = <T extends keyof mutations>(type: T, value?: mutations[T] ) => void;

@module({
  store: true
})
class MyStore {
  dispatch: TypedDispatch;
  commit: TypedCommit;
  prop = 'value';
  get myGetter(): string {
    return this.prop + ' gotten';
  }
  get myOtherGetter(): string {
    return this.myGetter + ' again';
  }
  @action
  myAction(payload: actions['myAction']) {
    this.commit('myMutation', this.myOtherGetter + payload.prop);
  }
  @mutation
  myMutation(payload: mutations['myMutation']) {
    this.prop = payload;
  }
}
```

## Example usage and code structure/layout

For futher answers and information, please check out the companion [vuex-ts-example](snaptopixel/vuex-ts-example) project. There you'll see the decorators in action as well guidance on how you can structure your code for the best results.