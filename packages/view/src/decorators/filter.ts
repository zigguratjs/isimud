import {propertyDecorator} from '@ziqquratu/core';
import {Selector} from '@ziqquratu/database';
import {SelectorPropertyAnnotation} from '../query';

/**
 * Configuration options for selector filter
 */
export interface FilterConfig<T> {
  /**
   * Function for compiling the selector object based on the value.
   *
   * If no compile function is given the a selector will be generated based on the name of the
   * decorated property and its value like so: {[key]: value}.
   */
  compile?: (value?: T) => object;

  /** Disable the filter when the filter value is equal to this. */
  disableOn?: T;
}

export class FilterAnnotation extends SelectorPropertyAnnotation {
  public constructor(
    private config: FilterConfig<any>,
    private propertyKey: string,
  ) {
    super();
  }

  public apply(selector: Selector, value: any) {
    if (value === this.config.disableOn) {
      return;
    }
    if (this.config.compile) {
      selector.filter(this.config.compile(value));
    } else {
      selector.filter({[this.propertyKey]: value});
    }
  }
}

/**
 * Filter documents by modifying the selector of the view.
 *
 * A view can have multiple filters. Each filter will extend the selector object
 * produced by the previous ones.
 *
 * @usageNotes
 * To filter documents on a certain key we simply create a property with the same name and assign
 * it a value.
 *
 * ```typescript
 * class MyView extends ItemSet {
 *   @filter() public category = 'cars';
 * }
 * ```
 * Changing the category using the above filter is now trivial:
 *
 * ```typescript
 * view.category = 'bikes';
 * ```
 * To disable the filter on a specific value we can set the 'disableOn' option.
 *
 * ```typescript
 * class MyView extends ItemSet {
 *   @filter({disableOn: 'all'}) public category = 'cars';
 * }
 * ```
 * Whenever the user sets category to 'all' the filter will be omitted.
 *
 * If we want to create a more complex filter we can use a compile function to turn our value
 * into a selector.
 *
 * ```typescript
 * class MyView extends ItemSet {
 *   @filter({
 *     compile: value => ({category: {$in: value}}),
 *   })
 *   public category = ['cars'];
 * }
 * ```
 */
export function filter<T>(config: FilterConfig<T> = {}) {
  return propertyDecorator<T>((target, propertyKey) => new FilterAnnotation(config, propertyKey));
}
