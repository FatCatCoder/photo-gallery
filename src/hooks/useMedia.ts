import { useState, useEffect } from 'react';
import { isPlatform } from '@ionic/react';

import { Camera as IonicCamera, CameraOptions } from '@ionic-native/camera';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { IUserPhoto } from '../models/IUserPhoto';
import { useGlobalStore } from '../GlobalStore';
import { v4 as uuidv4 } from 'uuid';


/*
  This hook functions as both a service layer and state management
  - main state lives in the global state store
*/

const MEDIA_DB_KEY = 'media';

export function useMedia() {
    // State //
    const dbstorage = useGlobalStore(state => state.dbstorage);

    // list of file names + extension (this is how our DB stores the files as paths must be recreated on each app load due to apple's filesystem dynamic folder shifting with GUIDs)
    const media = useGlobalStore(state => state.media);
    const setMedia = useGlobalStore(state => state.setMedia);

    // Methods //
    const deletePhoto = async (photoPath: string) => {
        // Remove this photo from the Photos reference data array
        const newPhotos = media.filter((p) => p !== photoPath);
      
        // Update photos array cache by overwriting the existing photo array
        await dbstorage?.set(MEDIA_DB_KEY, JSON.stringify(newPhotos));
      
        // delete photo file from filesystem
        const filename = photoPath.substr(photoPath.lastIndexOf('/') + 1);
        await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Data,
        });

        // adjust our current media filepaths to just filenames fo saivng to the DB
        let fixedNames = [];
        for(let x of newPhotos) {
          let fixedfilename = x.substr(x.lastIndexOf('/') + 1);
          fixedNames.push(fixedfilename);
        }

        // set db to updated list
        await dbstorage?.set(MEDIA_DB_KEY, JSON.stringify(fixedNames));

        // set our media list to the useable filepaths we created, not filenames
        setMedia(newPhotos);
      }

      const getUseableImagePath = async (imgName: string) => {
        let path = await Filesystem.getUri({path: imgName, directory: Directory.Data});
        return Capacitor.convertFileSrc(path.uri);
      }

      const loadSaved = async () => {
        // console.log("loading saved photos...")
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

  
