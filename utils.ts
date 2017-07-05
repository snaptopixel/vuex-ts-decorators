import Vuex, {ActionContext} from 'vuex';

// Copy properties between objects with a few additional features
export function copyOwnProperties(source: any, target: any, readonly = false) {
  Object.getOwnPropertyNames(source)
    .forEach(propertyKey => {
      const d = Object.getOwnPropertyDescriptor(source, propertyKey);
      // Readonly (non-writable) getters and properties
      if(readonly) {
        if(d.get) {
          delete d.set;
        } else {
          d.writable = false;
          d.configurable = false;
        }
      }
      Object.defineProperty(target, propertyKey, d);
    });
  return target;
}

// Manage a module's `this` in decorated getters, actions and mutations
export class ModuleScope {
  // These end up being the actual scopes and are cached once created
  private _actionScope_: any;
  private _getterScope_: any;
  // Proxied versions that can be called via `this` without action/mutation name, etc
  public actions: {[name: string]: any} = {};
  public mutations: {[name: string]: any} = {};
  public getters: {[name: string]: any} = {};
  // Returns the scope for `this` inside of decorated actions
  public actionScope(context: ActionContext<any, any>): any {
    if (!this._actionScope_) {
      this._actionScope_ = {
        state: {},
        // Expose `rootGetters` as `this.getters`
        getters: context.rootGetters,
        // Expose `this.commit`
        commit: context.commit,
        // Expose `this.dispatch`
        dispatch: context.dispatch,
      };
      // Expose all properties on `rootState` as readonly members of `this.state`
      copyOwnProperties(context.rootState, this._actionScope_.state, true);
      // Expose all properties on this module's `state` as readonly members of `this`
      copyOwnProperties(context.state, this._actionScope_, true);
      // Expose this module's actions as local functions on `this`
      copyOwnProperties(this.actions, this._actionScope_);
      // Expose this module's mutations as local functions on `this`
      copyOwnProperties(this.mutations, this._actionScope_);
      // Expose this modules getters as local getters on `this`
      copyOwnProperties(this.getters, this._actionScope_);
    }
    return this._actionScope_;
  }
  // Returns the scope for `this` inside of decorated getters
  public getterScope(state: any, rootState: any, rootGetters: any): any {
    if (!this._getterScope_) {
      this._getterScope_ = {
        state: {},
        // Expose `rootGetters` as `this.getters`
        getters: rootGetters
      };
      // Expose all properties on `rootState` as readonly members of `this.state`
      copyOwnProperties(rootState, this._getterScope_.state, true);
      // Expose all properties on this module's `state` as readonly members of `this`
      copyOwnProperties(state, this._getterScope_, true);
      // Expose this modules getters as local getters on `this`
      copyOwnProperties(this.getters, this._getterScope_);
    }
    return this._getterScope_;
  }
}