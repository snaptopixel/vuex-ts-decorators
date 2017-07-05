# Vuex IQ 💡 [![Build Status](https://img.shields.io/circleci/project/snaptopixel/vuex-ts-decorators/master.svg)](https://circleci.com/gh/snaptopixel/vuex-ts-decorators) [![npm package](https://img.shields.io/npm/v/vuex-ts-decorators.svg)](https://www.npmjs.com/package/vuex-ts-decorators)

Make your TypeScript-based Vuex applications smarter with full type-safety and code completion using a combination of decorators and patterns.

  - [Decorators Primer](#primer)
  - [Basic example](#basic-example)
      - [Without Decorators:](#without-decorators)
      - [With Decorators:](#with-decorators)
  - [Typing your stores and modules](#typing-your-stores-and-modules)
    - [Declaring actions, getters and mutations](#declaring-actions-getters-and-mutations)
  - [Example usage and code structure](#example-usage-and-code-structure)

## Decorators Primer

While working with decorators in TypeScript, it helps to have a basic understanding of what they are (and aren't) doing. With these decorators we'll write classes which are  _transformed_ into Vuex module/store definitions at runtime. It's important to note that we will never use `new` or `extends` with these decorated classes.

You may ask yourself:
> _"If a class is not really a class, why use `class` in the first place?"_

In this case, utilizing `class` allows for a straightforward and ergonomic syntax while also providing usable typings down the line. When we combine that benefit with the added convenience of a normalized scope for our actions, mutations and getters (provided by the decorators) we end up with less boilerplate, strict-typing and clearer code across the board.



## Basic example
The following snippet shows a standard Vuex declaration followed by an example using decorators.

#### Without Decorators:
```ts
const MyStore = new Vuex.Store({
  state: {
    prop: 'value'
  },
  getters: {
    ['myStore/myGetter'](state, getters) {
      return state.prop + ' gotten';
    },
    ['myStore/myOtherGetter'](state, getters) {
      return getters.myGetter + ' again';
    }
  },
  actions: {
    ['myStore/myAction']({commit, getters}, payload) {
      commit('myStore/myMutation', getters.['myStore/myOtherGetter'] + payload.prop);
    }
  },
  mutations: {
    ['myStore/myMutation'](state, payload) {
      state.prop = payload;
    }
  }
})
```
#### With Decorators:
```ts
@module()
class MyStore {
  prop = 'value';
  @getter('myStore/myGetter')
  get myGetter(): string {
    return this.prop + ' gotten';
  }
  @getter('myStore/myOtherGetter')
  get myOtherGetter(): string {
    return this.myGetter + ' again';
  }
  @action('myStore/myAction')
  private myAction(payload: string): Promise<void> {
    this.myMutation(this.myOtherGetter + payload.prop);
  }
  @mutation('myStore/myMutation')
  private myMutation(payload: string) {
    this.prop = payload;
  }
}
```

## Typing your stores and modules
It's important to note that by themselves, the included decorators do not provide full type-safety. Instead they allow us to write our stores and modules in a way that allows us to **achieve** type-safety via idomatic TypeScript patterns.

### Declaring actions, getters and mutations
Leveraging TypeScript's “declaration merging” we can easily specify our store's api to achieve type-safety and code-completion throughout our application. Let's start with a few declarations:

```ts
// myStore.ts

import {Store} from 'vuex-iq/constants';

declare module 'vuex-iq/constants' {
  interface Actions {
    // Action name   // Payload?
    'myStore/myAction': string;
  }
  interface Mutations {
    'myStore/myMutation': string;
  }
  interface Getters {
    'myStore/myGetter': string,
    'myStore/myOtherGetter': string
  }
}
```

## Example usage and code structure

For futher answers and information, please check out the companion [vuex-ts-example](https://github.com/snaptopixel/vuex-ts-example) project. You'll be able to see the decorators in action as well as some guidance on how you can structure your code for the best results.