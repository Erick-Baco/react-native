import { View, StyleSheet, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState, useRef } from "react";
import { type ImageSource } from "expo-image";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from "react-native-view-shot";
import domtoimage from "dom-to-image";

import ImageViewer from "@/components/ImageViewer";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import CircleButton from "@/components/CircleButton";
import EmojiPicker from "@/components/EmojiPicker";
import EmojiList from "@/components/EmojiList";
import EmojiSticker from "@/components/EmojiSticker";

const PlaceHolderImage = require('@/assets/images/background-image.png');

export default function Index() {

  // Variable que puede ser string o indefinido, por defecto indefinido o almacena la imagen
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  // Variable booleana que funciona para la lógica de mostrar y ocultar los botones después de seleccionar una imagen
  const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
  // Variable booleana que funciona como activador de EmojiPicker
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  //variable que almacena la fuente de a imagen 
  const [pickedEmoji, setPickedEmoji] = useState<ImageSource | undefined>(undefined);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef<View>(null);



  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });
    if(!result.canceled){
      setSelectedImage(result.assets[0].uri);
      setShowAppOptions(true);
    }else{
      alert('You did not select any image.')
    }
  }

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible(true);
  };

  const onCloseModal = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    if(Platform.OS !== 'web'){
      try{
        const localUri = await captureRef(imageRef,{
          height:440,
          quality: 1,
        });
  
        await MediaLibrary.saveToLibraryAsync(localUri);
        if(localUri){
          alert('saved');
        }
      }catch(e){
        console.log(e)
      }
    }else{
      try{
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });
        let link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch(e){
        console.log(e)
      }
    }
  };

  if(status === null){
    requestPermission();
  }

  return (
    //se el nuevo componente raiz de la página para los gestos con el sticker 
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer imgSource={PlaceHolderImage} selectedImage={selectedImage}/>
          {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
        </View>
        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon="refresh" label="Reset" onPress={onReset}/>
              <CircleButton onPress={onAddSticker}/>
              <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync}/>
            </View>
          </View>
        ):(
          <View style={styles.footerContainer}>
            <Button theme="primary" label="Choose a photo" onPress={pickImageAsync}/>
            <Button label="Use this photo" onPress={() => setShowAppOptions(true)}/>
          </View>
        )}
        <EmojiPicker isVisible={isModalVisible} onClose={onCloseModal}>
          <EmojiList onSelect={setPickedEmoji} onCloseModal={onCloseModal}/>
        </EmojiPicker> 
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },

  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },

  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});
