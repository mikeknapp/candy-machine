import { useContext, useState } from "react";
import { AppContext } from "../app";
import { AppData, DEFAULT_APP_DATA } from "../models/app";
import {
  ExtractProperties,
  Path,
  getNestedValue,
  setNestedValue,
} from "./types";
import { useSubscribe } from "./useSubscribe";

export function useAppState<P extends Path<AppData>[]>(
  ...selectors: P
): [ExtractProperties<AppData, P>, React.ContextType<typeof AppContext>] {
  const appContext = useContext(AppContext);

  if (selectors.length >= 0) {
    const [appValue, setAppValue] = useState<AppData>(DEFAULT_APP_DATA);

    useSubscribe(
      AppContext,
      (newValue: AppData) => {
        setAppValue(newValue);
      },
      selectors,
    );

    const selectedValues = selectors.reduce(
      (acc, selector) => {
        setNestedValue(acc, selector, getNestedValue(appValue, selector));
        return acc;
      },
      {} as ExtractProperties<AppData, P>,
    );

    return [selectedValues, appContext];
  }

  return [null, appContext];
}

export function useAppValue<P extends Path<AppData>[]>(...selectors: P) {
  return useAppState(...selectors)[0];
}

export function useApp() {
  return useAppState()[1];
}
