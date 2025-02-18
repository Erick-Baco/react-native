import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import {type ImageSource } from 'expo-image';

type Props = {
    imageSize: number;
    stickerSource: ImageSource;
};

export default function EmojiSticker({imageSize, stickerSource}: Props){

    // se utiliza el hool sharedvalue con imageSize para trabajar con este valor y que se modifique en tiempo real
    const scaleImage = useSharedValue(imageSize);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    //crear el gesto de doble tap, definiendo el numero de taps y después en la lógica se compara el tamaño actual con el tamaño al doble
    const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart(() => {
        if(scaleImage.value !== imageSize * 2){
            scaleImage.value = scaleImage.value * 2;
        }else{
            scaleImage.value = Math.round(scaleImage.value / 2)
        }
    });
    // gesto actualiza el valor de las posicones
    const drag = Gesture.Pan().onChange(event => {
        translateX.value += event.changeX;
        translateY.value += event.changeY;
    })
    //gesto que mueve el objeto mediante transform, dentro del animated.view se le asigna la propiedad de transform a x y
    const containerStyle = useAnimatedStyle(() => {
        return {
          transform: [
            {
              translateX: translateX.value,
            },
            {
              translateY: translateY.value,
            },
          ],
        };
      });
    const imageStyle = useAnimatedStyle(() => {
        return {
          width: withSpring(scaleImage.value),
          height: withSpring(scaleImage.value),
        };
    });
      

    return(
       <GestureDetector gesture={drag}> 
            <Animated.View style={[containerStyle, {top: -350}]}>
                <GestureDetector gesture={doubleTap}>
                    <Animated.Image source={stickerSource} style={[imageStyle, {width: imageSize, height: imageSize}]}  />
                </GestureDetector>
            </Animated.View>
       </GestureDetector> 
    );
}


