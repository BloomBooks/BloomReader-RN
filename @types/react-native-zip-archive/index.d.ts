declare module 'react-native-zip-archive' {
    import ReactNative, { EmitterSubscription } from "react-native";

    export function unzip(source: string, target: string): Promise<string>
    export function zip(source: string, target: string): Promise<string>  
    export function unzipAssets(assetPath: string, target: string): Promise<any>
    export function subscribe(callback: ({progress: number, filePath: string})):EmitterSubscription  
}