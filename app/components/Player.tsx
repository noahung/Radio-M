import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radioService, radioEvents } from '../services/RadioService';

export const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const subscription = radioEvents.addListener('playbackStateChanged', (state) => {
            setIsPlaying(state.isPlaying);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const handlePlayPause = () => {
        radioService.togglePlayback();
    };

    const handleStop = () => {
        radioService.stopService();
        setIsPlaying(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePlayPause} style={styles.button}>
                <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleStop} style={styles.button}>
                <Ionicons
                    name="stop"
                    size={24}
                    color="#FFFFFF"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#1a1a1a',
    },
    button: {
        padding: 10,
        marginHorizontal: 5,
    },
}); 