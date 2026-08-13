import { StyleSheet, View } from 'react-native';
import { useLinkBuilder } from '@react-navigation/native';
import { Text, PlatformPressable } from '@react-navigation/elements';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHouse,
  faArrowRightArrowLeft,
  faPlus,
  faWandMagicSparkles,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Layout,
  FadeIn,
  FadeOut,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(PlatformPressable);

function getIconByRouteName(routeName: string, color: string, focused: boolean) {
  const size = focused ? 25 : 23;
  switch (routeName) {
    case 'index':
      return <FontAwesomeIcon icon={faHouse} color={color} size={size} />;
    case 'transactions':
      return <FontAwesomeIcon icon={faArrowRightArrowLeft} color={color} size={size} />;
    case 'add':
      return <FontAwesomeIcon icon={faPlus} color={color} size={size} />;
    case 'assistance':
      return <FontAwesomeIcon icon={faWandMagicSparkles} color={color} size={size} />;
    case 'profile':
      return <FontAwesomeIcon icon={faUser} color={color} size={size} />;
  }
}

function TabItem({
  route,
  isFocused,
  onPress,
  onLongPress,
  href,
  accessibilityLabel,
  testID,
  label,
}: {
  route: { key: string; name: string };
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  href: string | undefined;
  accessibilityLabel: string | undefined;
  testID: string | undefined;
  label: string;
}) {
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFocused ? 1 : 0, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused]);

  const animatedPillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['transparent', '#a7ff77'],
    ),
  }));

  return (
    <AnimatedPressable
      key={route.key}
      href={href}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      layout={Layout.duration(260)}
      style={[styles.tabItem, animatedPillStyle]}
    >
      {getIconByRouteName(route.name, isFocused ? '#00360C' : '#8e8e8e', isFocused)}
      {isFocused && (
        <Animated.Text
          entering={FadeIn.duration(200).delay(80)}
          exiting={FadeOut.duration(120)}
          style={styles.text}
        >
          {label}
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
}

const CustomNavBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { buildHref } = useLinkBuilder();

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
            href={buildHref(route.name, route.params)}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            label={label as string}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    bottom: 30,
    borderRadius: 40,
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderRadius: 30,
    paddingVertical: 13,
  },
  text: {
    fontSize: 13,
    marginLeft: 7,
    color: '#00360C',
    fontWeight: 'bold',
  },
});

export default CustomNavBar;