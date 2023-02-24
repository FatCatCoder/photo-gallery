import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonSpinner,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { images, camera, videocam } from 'ionicons/icons';

import Photos from './pages/Photos';
import Tab2 from './pages/Tab2';
import { Storage } from '@ionic/storage';

import { useSqlDb } from './hooks/useSqlDb'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './App.css'
import { useEffect } from 'react';
import { useGlobalStore } from './GlobalStore';
import { useMedia } from './hooks/useMedia';

setupIonicReact();

const App: React.FC = () => 
{
  const db = useGlobalStore((state) => state.dbstorage);
  const { dbWasInitialized } = useSqlDb();
  const { importPhotos, importVideo } = useMedia();

  useEffect(() => {
    console.log('app useEffect');
  }, [])

  const ImportVideo = async() => {
    await importVideo();
  };

  const ImportPhotos = async () => {
    await importPhotos();
  };

  if(dbWasInitialized === false || db === null)
  return <IonApp><IonSpinner /> Loading...</IonApp>

  return (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/">
            <Photos />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="Photos" href="/">
            <IonIcon icon={images} />
            <IonLabel>Photos</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" onClick={async() => await ImportPhotos()}>
            <IonIcon icon={camera} />
            <IonLabel>Add Photos</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab3" onClick={async() => await ImportVideo()}>          
            <IonIcon icon={videocam} />          
            <IonLabel>Add Video</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
)}

export default App;
