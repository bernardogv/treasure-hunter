import { Platform } from 'react-native';

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
