import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

type CustomButtonProps = TouchableOpacityProps & {
  title: string;
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
  textClassName?: string;
  loadingColor?: string;
};

export default function CustomButton({
  title,
  isLoading = false,
  icon,
  className = "w-full bg-[#B1FF90] py-4 rounded-full items-center justify-center",
  textClassName = "text-[#004A10] font-bold text-xl",
  loadingColor = "#004A10",
  disabled,
  ...props
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || isLoading}
      className={className}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator color={loadingColor} />
      ) : (
        <>
          {icon}
          <Text className={textClassName}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
