import { camera, trash, close, add } from 'ionicons/icons';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonButton,
  IonActionSheet
} from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import { IUserPhoto } from '../models/IUserPhoto';
import { Filesystem, Directory } from '@capacitor/filesystem';
import './Tab2.css';
import 'capacitor-native-log';
import { Plugins } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import * as CameraApi from '@capacitor/camera';

import { Camera, CameraOptions } from '@ionic-native/camera';

const { CAPNativeLog } = Plugins;


const Tab2: React.FC = () => {
  // const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [photoToDelete, setPhotoToDelete] = useState<IUserPhoto>();

  const [photo, setPhoto] = useState<string>();
  const [vid, setvid] = useState<string>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoerr, setPhotoerr] = useState<string>();

  useEffect(() => {
    CAPNativeLog.log({ level: 'info', message: 'start useEffect tab2.tsx' });

    Device.getId().then((info) => { 
      CAPNativeLog.log({ level: 'info', message:  `app id: ${info.uuid}`});
    });

    async function loadPhoto() {
      try {
        CAPNativeLog.log({ level: 'info', message:  'try async'});
        const fullpath = 'file:///var/mobile/Containers/Data/Application/136DD64F-2AF4-4C17-8D96-5E7901A7C693/Documents/1676143654934.jpeg';
        // const file = await Filesystem.readFile({
        //   path: '1676143654934.jpeg',
        //   directory: Directory.Data,
        // });

        const readpath = await Filesystem.getUri({
          path: '1676143654934.jpeg', directory: Directory.Data
        });


        CAPNativeLog.log({ level: 'info', message:  'readpath.uri'});
        CAPNativeLog.log({ level: 'info', message:  readpath.uri});

        CAPNativeLog.log({ level: 'info', message: 'fullpath' });
        CAPNativeLog.log({ level: 'info', message: fullpath });

        // returns base64 encoded, must prepend with... data:image/jpeg;base64,
        const file = await Filesystem.readFile({
          path: readpath.uri
        });
  
        setPhoto(file.data);        
      } 
      catch (error) {
        CAPNativeLog.log({ level: 'info', message: 'failed' });
        console.log(error);
      }
    }
    
    loadPhoto().then(x => CAPNativeLog.log({ level: 'info', message: 'done' })).catch((x) => console.log(x)); 

  })

  const importPhotos = async() => {
    console.log('start import photos');

    let options: CameraOptions = {
      destinationType: Camera.DestinationType.NATIVE_URI,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: Camera.MediaType.ALLMEDIA,
    };  

    const imported = await Camera.getPicture(options);

    console.log(imported);

    setvid(Capacitor.convertFileSrc(imported));

    videoPlayerRef.current?.load();

    // const imported = await CameraApi.Camera.pickImages({});
    // let localphotos = [];
    // imported.photos.forEach((x) => console.log('x.webPath: '+ x.webPath, ' x.path: ' + x.path));

    
    // imported.photos.forEach((x) => localphotos.push('data:image/jpeg;base64,' + x.webPath));
  }

  const videoPlayerRef: React.RefObject<HTMLVideoElement> = useRef(null);


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Import</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen scrollY={false}>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Import</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid>

        {/* <IonImg src={photo} /> */}

          {/* <IonImg src={'data:image/jpeg;base64,' + photo} /> */}

          <video width="100%" height="100%" controls src={vid} ref={videoPlayerRef} />
          

          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg src={photo} />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" style={{position: 'absolute', bottom: '65px'}}>
          <IonFabButton onClick={async() => await importPhotos()}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
          {/* <IonFabButton onClick={() => takePhoto()}>
            <IonIcon icon={camera}></IonIcon>
          </IonFabButton> */}
        </IonFab>

        {/* End Page - this button provides perfect appbar padding */}
        <IonButton expand="block" style={{opacity: 0}}>
          Padding
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
