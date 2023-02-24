import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal, IonItem, IonList, IonGrid, IonRow, IonCol, IonImg, GestureDetail, createAnimation, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react';
import { isPlatform } from '@ionic/react';
import { useEffect, useRef, useState } from 'react';
import PhotoSwipe from '../components/PhotoSwipe';
import { createGesture, Gesture } from '@ionic/react';
import { StatusBar } from '@capacitor/status-bar';
import { useGlobalStore } from '../GlobalStore';
import { useMedia } from '../hooks/useMedia';

// styles
import '../App.css'
import './Photos.css';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';


const Tab1: React.FC = () => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);  
  const [openToStartIndex, setOpenToStartIndex] = useState(0);  
  const isZoomed = useGlobalStore((state) => state.isZoomed)
  const { media, setMedia, loadSaved, importPhotos, importVideo} = useMedia();

  useEffect(() => {
    loadSaved()
  }, [])

  // useEffect(() => {
  //   // console.log('media', media)
  //   // console.log('Directory.Data', Directory.Data)
  //   let loaded: string[] = [];
  //   Filesystem.readdir({path: "", directory: Directory.Data}).then((files) => {
  //     for(let file of files.files){
  //       console.log('file', file)
  //       loaded.push(Capacitor.convertFileSrc(file.uri))
  //     }
  //   })

  //   console.log(loaded)

  //   setMedia(loaded)
  // }, [])

  
  const GetIsZoomed = () => isZoomed;
  let startY = 0;
  const [endY, setendY] = useState(0);  
  let velocityYValues: number[] = [];

  const toggleModal = (startAt: number) => {
    if(isOpen){
      setIsOpen(false);
    }
    else{
      if(!isPlatform("mobileweb") || !isPlatform("desktop")){
        StatusBar.hide();
       }
      
       setOpenToStartIndex(startAt)
       setIsOpen(true);
    }
  }

  const onDidDismiss = () => {
    if(!isPlatform("mobileweb") || !isPlatform("desktop")){
      StatusBar.show();
     }
  }

  let gesture: Gesture  | null | undefined = null;

  useEffect(() => {
    if(isOpen){
      let domNode = document.querySelector("#example-modal")

      gesture = createGesture({
        el: modal.current as Node,
        threshold: 15,
        direction: 'y',
        gestureName: 'my-gesture',
        onMove: ev => onMoveHandler(ev),
        onEnd: ev => onEndHandler(ev),
        onStart: ev => onStartHandler(ev)
      });

      gesture.enable();
    }
    else{
      gesture?.destroy();
    }

    return () => {
      gesture?.destroy();
    }
  }, [isOpen, isZoomed]);

  
  const onStartHandler = (detail: GestureDetail) => {
    let touchEvent = detail.event as TouchEvent;

    if(touchEvent.touches.length === 1 || !GetIsZoomed()){ // ignore multiple touches & if zoomed
      setendY(0)
      startY = detail.currentY;

      if(modal?.current != null){
        modal.current.style.transform = "";
      }
    }
  }
  const onEndHandler = (detail: GestureDetail) => {
    let touchEvent = detail.event as TouchEvent;

    if(touchEvent.touches.length === 0){ // ignore multiple touches
      let average = velocityYValues.reduce(function (sum, value) {
          return sum + value;
      }, 0) / velocityYValues.length;


      if(
        (detail.currentY - startY >= 100 || average >= 0.4)
        && !isZoomed
        ){
          setendY(detail.currentY)
          setIsOpen(false); 
      }

      if(modal?.current != null)
         modal.current.style.transform = "";
    }
  }

  const onMoveHandler = (detail: GestureDetail) => {
    let touchEvent = detail.event as TouchEvent;

    if(touchEvent.touches.length === 1){ // ignore multiple touches
      const type = detail.type;
      const currentY = detail.currentY;
      const deltaY = detail.deltaY;
      const velocityY = detail.velocityY;
      const elem = detail.event.target as HTMLElement;

      setendY(detail.currentY);
      velocityYValues.push(velocityY);

      // only react to down events
      if(modal?.current != null 
        && elem.getBoundingClientRect().top >= 0
        && !GetIsZoomed()
        ) {
        let moveY = deltaY >= 0 ? deltaY : 0;
        modal.current.style.transform = `translateY(${moveY}px)`;
      } 
    }
  }

  const enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'translateY(100%)' },
        { offset: 1, opacity: '0.99', transform: 'translateY(0%)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(350)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };


  const leaveAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = createAnimation()
    .addElement(root?.querySelector('ion-backdrop')!)
    .fromTo('opacity', '0', '0');

    const wrapperAnimation = createAnimation()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0.99', transform: `translateY(${endY}px)`},
        { offset: 1, opacity: '0', transform: 'translateY(100%)' },
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(350)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  async function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    await loadSaved();
    event.detail.complete();
  }

  return (
    <IonPage className='page'>
      <IonContent fullscreen scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={async(x) => await handleRefresh(x)}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

          <IonGrid style={{overflowY: 'scroll'}}>
            <IonRow>
            {media.map((mediaURI, index) => {
              return (
                <IonCol key={mediaURI} size='4'>
                  {
                    (mediaURI.endsWith(".jpeg"))? 
                    <IonImg src={mediaURI} onClick={() => toggleModal(index)} style={{objectFit: 'cover', width: 'auto', height: 'calc(33vw - 2px)'}} />
                    :
                    <video style={{objectFit: 'cover', width: 'calc(33vw - 2px)', height: 'calc(33vw - 2px)', minHeight: 'calc(33vw - 2px)', minWidth: 'auto'}} controls>
                      <source src={mediaURI} type="video/mp4" />
                    </video>
                  }
                </IonCol>
              )
            })}
            </IonRow>
        </IonGrid>

        <IonModal 
          id="example-modal" 
          isOpen={isOpen} 
          ref={modal} 
          trigger="open-custom-dialog"
          enterAnimation={enterAnimation} 
          leaveAnimation={leaveAnimation}
          onDidDismiss={onDidDismiss}
        >
          <PhotoSwipe media={media} startIndex={openToStartIndex}></PhotoSwipe>
        </IonModal>

        <IonButton onClick={async() => await importPhotos()}>
            Add photos
        </IonButton>

        <IonButton onClick={async() => await loadSaved()}>
            load photos
        </IonButton>
        
        {/* End Page */}
        <IonButton disabled={true} id="open-custom-dialog" expand="block" style={{opacity: 0, display: 'none'}}>
          Open Custom Dialog
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
