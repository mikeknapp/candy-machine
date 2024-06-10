import { useContext, useState } from "react";
import { AppContext } from "../app";
import { AppData, DEFAULT_APP_DATA } from "../models/app";
import { extractFromSelectors } from "../models/base";
import { ExtractProperties, Path } from "./types";
import { useSubscribeApp } from "./useSubscribeApp";

export function useAppState<P extends Path<AppData>[]>(
  ...selectors: P
): [ExtractProperties<AppData, P>, React.ContextType<typeof AppContext>] {
  const appContext = useContext(AppContext);

  const [appValue, setAppValue] = useState<ExtractProperties<AppData, P>>(
    extractFromSelectors(selectors, DEFAULT_APP_DATA) as ExtractProperties<
      AppData,
      P
    >,
  );

  if (!selectors || selectors.length === 0) {
    throw new Error("At least one selector is required");
  }

  useSubscribeApp(
    AppContext,
    (newValue: ExtractProperties<AppData, P>) => {
      setAppValue(newValue);
    },
    selectors,
  );

  return [appValue, appContext];
}

export function useAppValue<P extends Path<AppData>[]>(...selectors: P) {
  return useAppState(...selectors)[0];
}

export function useApp() {
  return useContext(AppContext);
}
