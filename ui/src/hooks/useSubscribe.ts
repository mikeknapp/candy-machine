import { useContext, useEffect } from "react";
import { Subscribable } from "../models/base";

export function useSubscribe<DataType>(
  Context: React.Context<Subscribable<DataType>>,
  callback: (newValue: DataType) => void,
  dependencies: any[] = [],
) {
  let context = useContext(Context);

  // Listen to updates from the selected project.
  useEffect(() => {
    if (!context) return;
    const oldValue = context.readOnly;
    const callbackWrapper = (newValue: DataType) => {
      // Only send updates if the underlying data changes.
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        callback(newValue);
      }
    };
    context.subscribe(callbackWrapper);
    return () => context.unsubscribe(callbackWrapper);
  }, dependencies);
}
