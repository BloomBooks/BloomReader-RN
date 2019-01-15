declare module "react-native-hyperlink" {
  interface IProps {
    linkDefault?: boolean;
    linkStyle?: {
      color?: string;
    };
  }

  export default function Hyperlink(props: IProps): any;
}
