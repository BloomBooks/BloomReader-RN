import {
  NativeModules,
  DeviceEventEmitter,
  EmitterSubscription
} from "react-native";
import I18n from "../i18n/i18n";

const GetFromWifiModule = NativeModules.GetFromWifiModule;

interface ProgressMessageArgs {
  messageKey: string;
  messageLiterals: {} | null;
}

interface NewBookMessageArgs {
  filename: string;
}

export interface ProgressListener {
  stopListening: () => void;
}

export interface NewBookListener {
  stopListening: () => void;
}

export function startWiFiReceiver(
  handleProgressMessage: (message: string) => void
): ProgressListener {
  const subscription = DeviceEventEmitter.addListener(
    "ProgressMessage",
    ({ messageKey, messageLiterals }: ProgressMessageArgs) => {
      const translatedMessage = messageLiterals
        ? I18n.t(messageKey, messageLiterals)
        : I18n.t(messageKey);
      handleProgressMessage(translatedMessage);
    }
  );

  GetFromWifiModule.listen();

  return {
    stopListening: () => {
      subscription.remove();
      GetFromWifiModule.stopListening();
    }
  };
}

export function listenForNewBooks(
  handleNewBook: (filename: string) => void
): NewBookListener {
  const subscription = DeviceEventEmitter.addListener(
    "NewBook",
    ({ filename }: NewBookMessageArgs) => {
      handleNewBook(filename);
    }
  );

  return {
    stopListening: () => {
      subscription.remove();
    }
  };
}
