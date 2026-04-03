import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface Props {
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FadeIn: React.FC<Props> = ({
  delay = 0,
  duration = 400,
  direction = "up",
  distance = 20,
  children,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(
    direction === "none" ? 0 : distance
  )).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
  }, []);

  const transform =
    direction === "up" || direction === "down"
      ? [{ translateY: direction === "down" ? Animated.multiply(translate, -1) : translate }]
      : direction === "left" || direction === "right"
      ? [{ translateX: direction === "left" ? Animated.multiply(translate, -1) : translate }]
      : [];

  return (
    <Animated.View style={[{ opacity, transform }, style]}>
      {children}
    </Animated.View>
  );
};
