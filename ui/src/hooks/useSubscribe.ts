import _, { get } from "lodash";

import { useContext, useEffect, useRef } from "react";
import { Subscribable, SubscribableType } from "../models/base";

export function valueDidChange(
  selector: string,
  state1: any,
  state2: any,
): boolean {
  const value1 = get(state1, selector, null);
  const value2 = get(state2, selector, null);
  return !_.isEqual(value1, value2);
}

export function useSubscribe(
  Context: React.Context<Subscribable<SubscribableType>>,
  callback: (newValue: SubscribableType) => void,
  selectors: string[] = [],
) {
  let context = useContext(Context);
  const oldValue = useRef<SubscribableType>(null);

  // Listen to updates from the selected project.
  useEffect(() => {
    if (!context) {
      return;
    }
    const callbackWrapper = (newValue: SubscribableType) => {
      let didChange = true;

      if (oldValue.current) {
        didChange = false;
        if (selectors.length > 0) {
          // Map over the selectors, and stop as soon as we found a match.
          didChange = selectors.some((selector) =>
            valueDidChange(selector, oldValue.current, newValue),
          );
        }
      }
      if (didChange) {
        oldValue.current = newValue;
        callback(newValue);
      }
    };
    context.subscribe(callbackWrapper);
    return () => context.unsubscribe(callbackWrapper);
  }, [context]);
}
