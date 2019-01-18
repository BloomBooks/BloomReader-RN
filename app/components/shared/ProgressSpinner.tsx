import React from "react";
import * as Progress from "react-native-progress";
import ThemeColors from "../../util/ThemeColors";

export default function ProgressSpinner() {
  return (
    <Progress.Bar
      indeterminate={true}
      width={
        null /* This is correct for a full-width bar, despite the type-checker */
      }
      borderWidth={0}
      color={ThemeColors.darkRed}
    />
  );
}
