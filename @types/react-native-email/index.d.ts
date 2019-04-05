declare module "react-native-email" {
  interface EmailOptions {
    cc?: string | string[];
    bcc?: string | string[];
    subject?: string;
    body?: string;
  }

  export default function email(
    to: string | string[],
    options?: EmailOptions
  ): Promise<void>;
}
