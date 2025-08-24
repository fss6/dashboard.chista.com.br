import React from 'react';
import { View, Image, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  logoContainer: {
    width: 100,
    height: 60,
    marginRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#174A8B',
    textAlign: 'center',
  },
});

const PDFLogo = ({ useImage = false }) => {
  if (useImage) {
    return (
      <View style={styles.logoContainer}>
        <Image 
          style={styles.logo}
          src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo.png`}
        />
      </View>
    );
  }

  // Fallback para texto do logo
  return (
    <View style={styles.logoContainer}>
      <Text style={styles.logoText}>CHISTA</Text>
    </View>
  );
};

export default PDFLogo;
