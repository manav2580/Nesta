import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Rect, Path, Defs, Filter, FeDropShadow } from 'react-native-svg';

// SVG-based price marker that renders as a complete shape
const SVGPriceMarker = ({ price }: { price: string }) => {
  const markerWidth = Math.max(60, price.length * 8 + 20);
  const markerHeight = 30;
  const arrowHeight = 8;
  
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg 
        width={markerWidth} 
        height={markerHeight + arrowHeight} 
        viewBox={`0 0 ${markerWidth} ${markerHeight + arrowHeight}`}
      >
        <Defs>
          <Filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <FeDropShadow 
              dx="0" 
              dy="2" 
              stdDeviation="3" 
              floodColor="#000000" 
              floodOpacity="0.3"
            />
          </Filter>
        </Defs>
        
        {/* Main rounded rectangle */}
        <Rect
          x="0"
          y="0"
          width={markerWidth}
          height={markerHeight}
          rx="15"
          ry="15"
          fill="#FFFFFF"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
          filter="url(#shadow)"
        />
        
        {/* Arrow pointing down */}
        <Path
          d={`M${markerWidth/2 - 6} ${markerHeight} L${markerWidth/2} ${markerHeight + arrowHeight} L${markerWidth/2 + 6} ${markerHeight} Z`}
          fill="#FFFFFF"
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="1"
        />
      </Svg>
      
      {/* Text overlay */}
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: markerHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: '#222222',
            fontWeight: '600',
            fontSize: 12,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          ₹{price}
        </Text>
      </View>
    </View>
  );
};

// Alternative: Using react-native-canvas for drawing
// First install: npm install react-native-canvas
// Note: This requires additional setup for react-native-canvas

const CanvasPriceMarker = ({ price }: { price: string }) => {
  // This would require react-native-canvas setup
  // Commenting out for now as it needs additional dependencies
  /*
  const Canvas = require('react-native-canvas').default;
  
  return (
    <Canvas
      style={{ width: 80, height: 40 }}
      ref={(canvas) => {
        if (canvas) {
          const ctx = canvas.getContext('2d');
          // Draw rounded rectangle
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          // ... canvas drawing code
        }
      }}
    />
  );
  */
};

// Simple solution using react-native-super-grid or absolute positioning
const AbsolutePriceMarker = ({ price }: { price: string }) => {
  const markerWidth = Math.max(60, price.length * 8 + 16);
  
  return (
    <View 
      style={{ 
        width: markerWidth + 10,
        height: 45,
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* Background shape using multiple Views */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 15,
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.15)',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
          minWidth: 50,
        }}
      >
        <Text
          style={{
            color: '#222222',
            fontWeight: '600',
            fontSize: 11,
            textAlign: 'center',
            lineHeight: 13,
          }}
          numberOfLines={1}
        >
          ₹{price}
        </Text>
      </View>
      
      {/* Arrow using transform */}
      <View
        style={{
          width: 12,
          height: 12,
          backgroundColor: '#FFFFFF',
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: 'rgba(0,0,0,0.15)',
          transform: [{ rotate: '45deg' }],
          marginTop: -6,
        }}
      />
    </View>
  );
};

// Installation commands for SVG support:
// npm install react-native-svg
// For iOS: cd ios && pod install
// For Android: Follow react-native-svg setup guide

// Usage in your MapView:
/*
import { SVGPriceMarker } from './path-to-this-file';

<Marker
  key={item.$id}
  coordinate={{
    latitude: item.latitude,
    longitude: item.longitude,
  }}
  anchor={{ x: 0.5, y: 1 }}
  centerOffset={{ x: 0, y: -10 }}
  onPress={() => handleCardPress(item.$id)}
>
  <SVGPriceMarker
    price={
      item.pricingDetails?.[0]?.amount
        ? item.pricingDetails[0].amount.toLocaleString()
        : "-"
    }
  />
</Marker>
*/

export { SVGPriceMarker, AbsolutePriceMarker };