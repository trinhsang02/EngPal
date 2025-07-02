import React, { useRef, useEffect, useState } from 'react';
import { Animated, PanResponder, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FloatingButtonProps {
    onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
    const [screenData, setScreenData] = useState(Dimensions.get('window'));
    const pan = useRef(new Animated.ValueXY({ x: screenData.width - 80, y: screenData.height / 2 })).current;
    const buttonSize = 48; // Size of the button (diameter)

    useEffect(() => {
        const onChange = (result: any) => {
            setScreenData(result.window);
        };

        const subscription = Dimensions.addEventListener('change', onChange);
        return () => subscription?.remove();
    }, []);

    const getValue = (val: Animated.Value) => {
        // @ts-ignore
        return typeof val.__getValue === 'function' ? val.__getValue() : 0;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: getValue(pan.x),
                    y: getValue(pan.y),
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState) => {
                // Calculate new position
                const newX = getValue(pan.x) + gestureState.dx;
                const newY = getValue(pan.y) + gestureState.dy;

                // Apply constraints to keep button within screen bounds
                const constrainedX = Math.max(0, Math.min(screenData.width - buttonSize, newX));
                const constrainedY = Math.max(0, Math.min(screenData.height - buttonSize - 100, newY)); // -100 for navigation bars

                Animated.event(
                    [null, { dx: pan.x, dy: pan.y }],
                    { useNativeDriver: false }
                )(evt, gestureState);
            },
            onPanResponderRelease: () => {
                pan.flattenOffset();

                // Optional: Snap to edge of screen
                const currentX = getValue(pan.x);
                const currentY = getValue(pan.y);

                // Snap to the nearest edge (left or right)
                const snapToLeft = currentX < screenData.width / 2;
                const targetX = snapToLeft ? 20 : screenData.width - buttonSize - 20;

                Animated.spring(pan, {
                    toValue: { x: targetX, y: Math.max(20, Math.min(screenData.height - buttonSize - 120, currentY)) },
                    useNativeDriver: false,
                    tension: 100,
                    friction: 8,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            style={[
                styles.floating,
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    width: buttonSize,
                    height: buttonSize,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
                <MaterialIcons name="translate" size={24} color="#4285F4" />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    floating: {
        position: 'absolute',
        zIndex: 1000,
        elevation: 1000, // For Android
    },
    button: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 12,
        elevation: 8,
        shadowColor: '#000', // For iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 1,
        borderColor: '#ddd',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
    },
});

export default FloatingButton; 