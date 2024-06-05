import { useContext, useState } from "react";
import { AppContext } from "../app";
import { App, AppData, DEFAULT_APP_DATA } from "../models/app";
import { useSubscribe } from "./useSubscribe";

export function useAppState(): [AppData, App] {
  const appContext = useContext(AppContext);

  const [appValue, setAppValue] = useState<AppData>(DEFAULT_APP_DATA);

  useSubscribe(AppContext, (newValue: AppData) => {
    setAppValue(newValue);
  });

  return [appValue, appContext];
}

export function useAppValue() {
  return useAppState()[0];
}

export function useApp() {
  return useAppState()[1];
}
