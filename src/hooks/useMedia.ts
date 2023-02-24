import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera as IonicCamera, CameraOptions } from '@ionic-native/camera';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { IUserPhoto } from '../models/IUserPhoto';
import { useGlobalStore } from '../GlobalStore';
import { v4 as uuidv4 } from 'uuid';


const MEDIA_DB_KEY = 'media';
export function useMedia() {
    // State //
    const dbstorage = useGlobalStore(state => state.dbstorage);
    const [photos, setPhotos] = useState<IUserPhoto[]>([]);
    const media = useGlobalStore(state => state.media);
    const setMedia = useGlobalStore(state => state.setMedia);

    // Lifecycle & effects //
    useEffect(() => {
        //loadSaved();
      }, []);

    // Methods //
    const deletePhoto = async (photo: IUserPhoto) => {
        // Remove this photo from the Photos reference data array
        const newPhotos = photos.filter((p) => p.filepath !== photo.filepath);
      
        // Update photos array cache by overwriting the existing photo array
        await dbstorage?.set(MEDIA_DB_KEY, JSON.stringify(newPhotos));
      
        // delete photo file from filesystem
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
        await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Data,
        });
        setPhotos(newPhotos);
      }

    const savePicture = async (photo: Photo, fileName: string): Promise<IUserPhoto> => {
        let base64Data: string;
        // "hybrid" will detect Cordova or Capacitor;
        if (isPlatform('hybrid')) {
          const file = await Filesystem.readFile({
            path: photo.path!,
          });
          base64Data = file.data;
        } else {
          base64Data = await base64FromPath(photo.webPath!);
        }
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Data,
        });
      
        if (isPlatform('hybrid')) {
          // Display the new image by rewriting the 'file://' path to HTTP
          // Details: https://ionicframework.com/docs/building/webview#file-protocol
          return {
            filepath: savedFile.uri,
            webviewPath: Capacitor.convertFileSrc(savedFile.uri),
          };
        } else {
          // Use webPath to display the new image instead of base64 since it's
          // already loaded into memory
          return {
            filepath: fileName,
            webviewPath: photo.webPath,
          };
        }
      };

      const getUseableImagePath = async (imgName: string) => {
        let path = await Filesystem.getUri({path: imgName, directory: Directory.Data});
        return Capacitor.convertFileSrc(path.uri);
      }

      const loadSaved = async () => {
        console.log("loading saved photos...")
        const value = await dbstorage?.get(MEDIA_DB_KEY);
        const photosInPreferences = (value ? JSON.parse(value) : []) as string[];

        let useablePaths = [];
        for(let x of photosInPreferences) {
          let useable = await getUseableImagePath(x);
          useablePaths.push(useable);
        }

        setMedia(useablePaths);
      };

      const importPhotos = async() => {
        let photoNamesToBeSaved = [];
        let photoPathsToBeSaved = [];
        let picked = await Camera.pickImages({});
      
        // copy data to local folder and generate a unique filename and usable path
        for(let photo of picked.photos) {
          let fileData = await Filesystem.readFile({path: photo?.path ?? photo.webPath as string})
          let pathFileName: string = uuidv4() + '.jpeg';
          let saveFile = await Filesystem.writeFile({path: pathFileName, data: fileData.data, directory: Directory.Data}); 

          let usablePath = await getUseableImagePath(pathFileName);
          photoPathsToBeSaved.push(usablePath);
          photoNamesToBeSaved.push(pathFileName);
        }
    
        // refetch all photos
        const mediaFsData = await dbstorage?.get(MEDIA_DB_KEY);
        const mediaArray = (mediaFsData ? JSON.parse(mediaFsData) : []) as string[];

        // convert all to usable img tag paths
        let readablePaths = [...photoPathsToBeSaved];
        for(let x of mediaArray) {
          readablePaths.push(Capacitor.convertFileSrc(x));
        } 

        // save (old + new) as a list of photo names in sqllite db file
        mediaArray.push(...photoNamesToBeSaved);
        await dbstorage?.set(MEDIA_DB_KEY, JSON.stringify(mediaArray));

        // update UI
        setMedia(mediaArray);
      }

      const importVideo = async() => {
        let options: CameraOptions = {
          destinationType: IonicCamera.DestinationType.NATIVE_URI,
          sourceType: IonicCamera.PictureSourceType.PHOTOLIBRARY,
          mediaType: IonicCamera.MediaType.VIDEO,
        };  
    
        const importedAsPath = await IonicCamera.getPicture(options);

        let fileData = await Filesystem.readFile({path: importedAsPath as string})
        let pathFileName: string = uuidv4() + '.mov';
        let saveFile = await Filesystem.writeFile({path: pathFileName, data: fileData.data, directory: Directory.Data});

        const mediaFsData = await dbstorage?.get(MEDIA_DB_KEY);
        const mediaArray = (mediaFsData ? JSON.parse(mediaFsData) : []) as string[];
        await dbstorage?.set(MEDIA_DB_KEY, JSON.stringify([...mediaArray, pathFileName]));

        let useablePath = Capacitor.convertFileSrc(saveFile.uri); 
        setMedia([...media, useablePath]);
      }
    
  
    return {
        media,
        setMedia,
        loadSaved,
        deletePhoto, 
        importPhotos,
        importVideo
    };
  }

  export function createUseableMediaFromData(data: string): string {
    return `data:image/jpeg;base64,${data}`
  }

  export async function base64FromPath(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject('method did not return a string');
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  
