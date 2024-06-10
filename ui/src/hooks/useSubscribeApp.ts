import { useContext, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { App, AppData } from "../models/app";
import { ExtractProperties, Path } from "./types";

export function useSubscribeApp<P extends Path<AppData>[]>(
  Context: React.Context<App>,
  callback: (newValue: ExtractProperties<AppData, P>) => void,
  selectors: P,
) {
  const subscriptionId = useRef<string>(uuidv4());
  let context = useContext(Context);

  useEffect(() => {
    if (!context) {
      return;
    }
    context.subscribe<AppData>(subscriptionId.current, callback, selectors);
    return () => context.unsubscribe(subscriptionId.current);
  }, [context]);
}
