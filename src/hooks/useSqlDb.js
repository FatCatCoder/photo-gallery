import { Drivers, Storage } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import React from 'react'
import { useGlobalStore } from '../GlobalStore';

export function useSqlDb() {
  const [dbWasInitialized, setdbWasInitialized] = React.useState(false);
  const setdbstorage = useGlobalStore(state => state.setdbstorage);

  const dbstore = new Storage({
    driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
  });

  React.useEffect(() => {
    async function localsetup() {
      if(!dbWasInitialized){
        await dbstore.defineDriver(CordovaSQLiteDriver);
  
        let createNewDb = await dbstore.create();
        setdbstorage(createNewDb);
      }
    };

    localsetup().then(() => setdbWasInitialized(true));

  }, []);

  return {
    dbWasInitialized
  }
}
