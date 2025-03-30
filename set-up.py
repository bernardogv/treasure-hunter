#!/usr/bin/env python3
import os
import sys
import json

def create_directory(path):
    """Create directory if it doesn't exist"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"Created directory: {path}")

def create_file(path, content=""):
    """Create file with optional content"""
    directory = os.path.dirname(path)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)
    
    if not os.path.exists(path):
        with open(path, 'w') as f:
            f.write(content)
        print(f"Created file: {path}")

def create_treasure_hunter_structure(base_path):
    """Create the entire folder structure for the Treasure Hunter app"""
    # Root level directories - skip creating the base directory since it already exists
    create_directory(os.path.join(base_path, ".vscode"))
    create_directory(os.path.join(base_path, "android"))
    create_directory(os.path.join(base_path, "ios"))
    create_directory(os.path.join(base_path, "src"))
    create_directory(os.path.join(base_path, "backend"))
    create_directory(os.path.join(base_path, "docs"))
    create_directory(os.path.join(base_path, "tests"))
    create_directory(os.path.join(base_path, "scripts"))

    # src directory structure
    src_path = os.path.join(base_path, "src")
    for folder in ["api", "assets", "components", "context", "hooks", "navigation", 
                  "screens", "services", "store", "styles", "utils"]:
        create_directory(os.path.join(src_path, folder))
    
    # assets subfolders
    assets_path = os.path.join(src_path, "assets")
    for subfolder in ["fonts", "images", "animations"]:
        create_directory(os.path.join(assets_path, subfolder))
    
    # components subfolders
    components_path = os.path.join(src_path, "components")
    for subfolder in ["common", "discovery", "listings", "offers", "messaging"]:
        create_directory(os.path.join(components_path, subfolder))
    
    # screens subfolders
    screens_path = os.path.join(src_path, "screens")
    for subfolder in ["auth", "discovery", "messaging", "profile", "merchant"]:
        create_directory(os.path.join(screens_path, subfolder))
    
    # store subfolders
    store_path = os.path.join(src_path, "store")
    for subfolder in ["actions", "reducers", "selectors"]:
        create_directory(os.path.join(store_path, subfolder))
    
    # backend structure
    backend_path = os.path.join(base_path, "backend")
    for subfolder in ["controllers", "models", "routes", "services", "middleware", "config"]:
        create_directory(os.path.join(backend_path, subfolder))
    
    # docs structure
    docs_path = os.path.join(base_path, "docs")
    for subfolder in ["api", "architecture", "setup", "ui"]:
        create_directory(os.path.join(docs_path, subfolder))
    
    # tests structure
    tests_path = os.path.join(base_path, "tests")
    for subfolder in ["unit", "integration", "e2e", "fixtures"]:
        create_directory(os.path.join(tests_path, subfolder))
    
    # Create important files
    # VS Code settings
    vscode_settings = {
        "editor.formatOnSave": True,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.tabSize": 2,
        "javascript.updateImportsOnFileMove.enabled": "always",
        "editor.codeActionsOnSave": {
            "source.fixAll.eslint": True
        }
    }
    create_file(
        os.path.join(base_path, ".vscode", "settings.json"), 
        json.dumps(vscode_settings, indent=2)
    )
    
    # API config file
    api_config_content = """// API Configuration
export const API_BASE_URL = 'https://api.treasurehunter.com';
export const API_TIMEOUT = 10000; // 10 seconds

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PASSWORD_RESET: '/auth/password-reset',
  },
  LISTINGS: {
    GET_ALL: '/listings',
    GET_ONE: '/listings/:id',
    CREATE: '/listings',
    UPDATE: '/listings/:id',
    DELETE: '/listings/:id',
    MERCHANT: '/listings/merchant',
  },
  DISCOVERY: {
    GET_ITEMS: '/discovery',
    INTERACTION: '/discovery/interaction',
  },
  // Add other endpoints here
};
"""
    create_file(os.path.join(src_path, "api", "config.js"), api_config_content)
    
    # Common component example
    button_component = """import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../styles';

const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false, 
  style = {} 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[type],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${type}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;
"""
    create_file(os.path.join(components_path, "common", "Button.js"), button_component)
    
    # Colors style file - updated with treasure-hunting theme
    colors_style = """// Color palette for Treasure Hunter app
export default {
  // Primary brand colors
  primary: '#A36F09', // Golden Brown - main brand color
  secondary: '#D4AF37', // Metallic Gold - complementary color
  
  // UI colors
  background: '#F9F5EB', // Parchment - for backgrounds
  surface: '#FFFFFF', // White - for cards and surfaces
  
  // Text colors
  textPrimary: '#2F2F2F', // Dark Gray - primary text
  textSecondary: '#5A5A5A', // Medium Gray - secondary text
  textTertiary: '#8A8A8A', // Light Gray - tertiary text
  
  // Status colors
  success: '#4CAF50', // Green - for success states
  warning: '#FFC107', // Amber - for warning states
  error: '#F44336', // Red - for error states
  info: '#2196F3', // Blue - for information states
  
  // Common colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Specific UI element colors
  divider: '#E0E0E0', // Light Gray - for dividers
  backdrop: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black - for modals
  
  // Action colors
  actionPositive: '#A36F09', // Golden Brown - for right swipes
  actionNegative: '#8A8A8A', // Light Gray - for left swipes
};
"""
    create_file(os.path.join(src_path, "styles", "colors.js"), colors_style)
    
    # Typography style file
    typography_style = """import { Platform } from 'react-native';

// Typography scale for Treasure Hunter app
export default {
  // Font families
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    // Add custom fonts here once imported
    decorative: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  
  // Predefined text styles
  header1: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  header2: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  header3: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 26,
  },
  body: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 20,
  },
  caption: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
  button: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  price: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  treasureHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
  },
};
"""
    create_file(os.path.join(src_path, "styles", "typography.js"), typography_style)
    
    # Example README - updated for Treasure Hunter
    readme_content = """# Treasure Hunter App

A marketplace app that connects antique stores with treasure hunters using a Tinder-like interface.

## Features

- Swipe-based discovery of antique treasures
- Location-based filtering
- In-app messaging for negotiation
- Merchant dashboard for inventory management
- Simple photo-based listing creation

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native environment setup
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/your-username/treasure-hunter.git
   cd treasure-hunter
   ```

2. Install dependencies
   ```
   npm install
   ```
   
3. Run the app
   - For iOS:
     ```
     npx react-native run-ios
     ```
   - For Android:
     ```
     npx react-native run-android
     ```

## Project Structure

See `docs/architecture` for detailed information on the project structure and architecture.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
"""
    create_file(os.path.join(base_path, "README.md"), readme_content)
    
    # Package.json - updated for Treasure Hunter
    package_json = {
        "name": "treasure-hunter",
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "android": "react-native run-android",
            "ios": "react-native run-ios",
            "start": "react-native start",
            "test": "jest",
            "lint": "eslint ."
        },
        "dependencies": {
            "react": "^18.2.0",
            "react-native": "^0.72.0",
            "react-native-gesture-handler": "^2.12.0",
            "react-native-reanimated": "^3.3.0",
            "react-native-safe-area-context": "^4.6.0",
            "react-native-screens": "^3.22.0",
            "@react-navigation/native": "^6.1.7",
            "@react-navigation/stack": "^6.3.17",
            "axios": "^1.4.0"
        },
        "devDependencies": {
            "@babel/core": "^7.22.5",
            "@babel/preset-env": "^7.22.5",
            "@babel/runtime": "^7.22.5",
            "@react-native/eslint-config": "^0.72.2",
            "@react-native/metro-config": "^0.72.6",
            "@tsconfig/react-native": "^3.0.0",
            "@types/metro-config": "^0.76.3",
            "@types/react": "^18.2.14",
            "babel-jest": "^29.5.0",
            "eslint": "^8.43.0",
            "jest": "^29.5.0",
            "metro-react-native-babel-preset": "^0.76.7",
            "prettier": "^2.8.8"
        }
    }
    create_file(os.path.join(base_path, "package.json"), json.dumps(package_json, indent=2))
    
    # Basic ESLint config
    eslint_config = """module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'prettier/prettier': 'error',
  },
};
"""
    create_file(os.path.join(base_path, ".eslintrc.js"), eslint_config)
    
    # Basic Prettier config
    prettier_config = """module.exports = {
  bracketSpacing: true,
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'avoid',
  printWidth: 100,
};
"""
    create_file(os.path.join(base_path, ".prettierrc.js"), prettier_config)
    
    # Create gitignore
    gitignore_content = """# OSX
#
.DS_Store

# Xcode
#
build/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
*.xccheckout
*.moved-aside
DerivedData
*.hmap
*.ipa
*.xcuserstate
ios/.xcode.env.local

# Android/IntelliJ
#
build/
.idea
.gradle
local.properties
*.iml
*.hprof
.cxx/
*.keystore
!debug.keystore

# node.js
#
node_modules/
npm-debug.log
yarn-error.log

# fastlane
#
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output

# Bundle artifact
*.jsbundle

# Ruby / CocoaPods
/ios/Pods/
/vendor/bundle/

# Temporary files created by Metro
.metro-health-check*

# testing
/coverage
"""
    create_file(os.path.join(base_path, ".gitignore"), gitignore_content)
    
    # Babel config
    babel_config = """module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
"""
    create_file(os.path.join(base_path, "babel.config.js"), babel_config)
    
    # Metro config
    metro_config = """const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  
  return config;
})();
"""
    create_file(os.path.join(base_path, "metro.config.js"), metro_config)
    
    # App.js file
    app_js = """import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/navigation';

const App = () => {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <MainNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
"""
    create_file(os.path.join(base_path, "App.js"), app_js)
    
    # Main navigator
    navigator_js = """import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MerchantNavigator from './MerchantNavigator';

const RootStack = createStackNavigator();

const Navigation = () => {
  // You would check here if the user is authenticated
  const isAuthenticated = false;
  const isMerchant = false;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : isMerchant ? (
        <RootStack.Screen name="MerchantApp" component={MerchantNavigator} />
      ) : (
        <RootStack.Screen name="MainApp" component={MainNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default Navigation;
"""
    create_file(os.path.join(src_path, "navigation", "index.js"), navigator_js)
    
    # Auth navigator
    auth_navigator_js = """import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Import your auth screens here
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';

const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      {/* 
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
"""
    create_file(os.path.join(src_path, "navigation", "AuthNavigator.js"), auth_navigator_js)
    
    # Main app navigator
    main_navigator_js = """import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import your main screens here
// import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
// import MessagingScreen from '../screens/messaging/ConversationsScreen';
// import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  return (
    <Tab.Navigator>
      {/*
      <Tab.Screen name="Discovery" component={DiscoveryScreen} />
      <Tab.Screen name="Messages" component={MessagingScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      */}
    </Tab.Navigator>
  );
};

export default MainNavigator;
"""
    create_file(os.path.join(src_path, "navigation", "MainNavigator.js"), main_navigator_js)
    
    # Merchant navigator
    merchant_navigator_js = """import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// Import your merchant screens here
// import DashboardScreen from '../screens/merchant/DashboardScreen';
// import InventoryScreen from '../screens/merchant/InventoryScreen';
// import OffersScreen from '../screens/merchant/OffersScreen';

const Tab = createBottomTabNavigator();

const MerchantNavigator = () => {
  return (
    <Tab.Navigator>
      {/*
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} />
      */}
    </Tab.Navigator>
  );
};

export default MerchantNavigator;
"""
    create_file(os.path.join(src_path, "navigation", "MerchantNavigator.js"), merchant_navigator_js)
    
    # Create a basic swipe card component
    swipe_card_js = """import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography } from '../../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const SwipeCard = ({ item, onSwipeLeft, onSwipeRight }) => {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const onSwipe = (direction) => {
    if (direction === 'left') {
      onSwipeLeft && onSwipeLeft(item);
    } else {
      onSwipeRight && onSwipeRight(item);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      // Calculate rotation based on swipe distance
      rotate.value = (translateX.value / SCREEN_WIDTH) * 15; // 15 degree max rotation
    },
    onEnd: (event) => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        // Swiped left past threshold
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('left');
      } else if (translateX.value > SWIPE_THRESHOLD) {
        // Swiped right past threshold
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(onSwipe)('right');
      } else {
        // Return to center
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: item.images[0] }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>${item.price}</Text>
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: colors.surface,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    ...typography.header3,
    marginBottom: 8,
  },
  price: {
    ...typography.price,
    color: colors.primary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});

export default SwipeCard;
"""
    create_file(os.path.join(components_path, "discovery", "SwipeCard.js"), swipe_card_js)
    
    print("\nTreasure Hunter App folder structure has been created successfully!")
    print(f"Project location: {os.path.abspath(base_path)}")
    print("\nNext steps:")
    print("1. Navigate to the project directory")
    print("2. Run 'npm install' to install dependencies")
    print("3. Run 'npx react-native start' to start the Metro bundler")
    print("4. In another terminal, run 'npx react-native run-android' or 'npx react-native run-ios'")

if __name__ == "__main__":
    # Use current directory since we're already in the treasure-hunter folder
    project_path = os.getcwd()
    create_treasure_hunter_structure(project_path)