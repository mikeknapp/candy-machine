import { useContext, useEffect, useState } from "react";
import { Subscribable } from "../models/base";

export function useSubscribe<DataType>(
  Context: React.Context<Subscribable<DataType>>,
  callback: (newValue: DataType) => void,
) {
  let context = useContext(Context);
  const [oldValue, setOldValue] = useState<DataType>(null);

  // Listen to updates from the selected project.
  useEffect(() => {
    if (!context) {
      return;
    }
    const callbackWrapper = (newValue: DataType) => {
      // Only send updates if the underlying data changes.
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        setOldValue(newValue);
        callback(newValue);
      }
    };
    context.subscribe(callbackWrapper);
    return () => context.unsubscribe(callbackWrapper);
  }, [context]);
}
