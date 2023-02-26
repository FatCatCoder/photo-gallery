import React, { useEffect, useRef, useState } from "react";

// Import Swiper React components
import { Zoom, Navigation, Pagination, FreeMode, Thumbs, Virtual } from "swiper";
import { Swiper, SwiperSlide, SwiperRef, useSwiper } from "swiper/react";
import { Swiper as SwiperType } from "swiper/types";
import { IonIcon, IonGrid, IonCol, IonRow, IonImg, IonToolbar, IonButton, IonButtons } from "@ionic/react";
import { chevronBackOutline, shareOutline, trashOutline } from 'ionicons/icons';
import { isPlatform } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Share } from '@capacitor/share';
import { Dialog } from '@capacitor/dialog';
import { useGlobalStore } from '../GlobalStore';
import { useMedia } from "../hooks/useMedia";


// Import Swiper styles
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import 'swiper/css/virtual';
import './PhotoSwipe.css';
import { on } from "events";
import { Directory, Filesystem } from "@capacitor/filesystem";


export default function PhotoSwipe(props: any) {  
    const isZoomed = useGlobalStore((state) => state.isZoomed)
    const setIsZoomed = useGlobalStore((state) => state.setIsZoomed)
    const media = useGlobalStore((state) => state.media);   
    const [showToolbox, setShowToolbox] = useState<boolean>(false);
    const [isViewingPhoto, setIsViewingPhoto] = useState<boolean>(true);
    const [mediaItems, setMediaItems] = useState<string[]>([]);
    const [mainSwiper, setMainSwiper] = useState<SwiperType>();
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType>();
    const [activeIndex, setActiveIndex] = useState<number>(props.startIndex ?? 0);
    const [isVirtual, setIsVirtual] = useState<boolean>(false);
    const { deletePhoto } = useMedia();            

    useEffect(() => {
        try {
            // setMediaItems(props.media)
            setActiveIndex(props.startIndex)
            setIsVirtual(false)

        } catch (error) {
            console.log(error)  
        }
    }, [])

    useEffect(() => {
        setMediaItems(media)
    }, [])

    const onClick = (e: any) => {
        setShowToolbox(!showToolbox)

        if(!isPlatform("mobileweb") || !isPlatform("desktop")){
            StatusBar.getInfo().then(info => info.visible? StatusBar.hide(): StatusBar.show()); 
        }
    }

    const onZoomChange = (swiper: SwiperType, scale: number, imageEl: HTMLElement, slideEl: HTMLElement)  => {
        if(scale != 1){
            setIsZoomed(true)
        }  
        else{
            setIsZoomed(false)
        }
    }

    const onSlideChange = (currswiper: SwiperType, isThumbsSwiper: boolean = false) => {
        if(activeIndex != currswiper.activeIndex && !isThumbsSwiper){
            setActiveIndex(currswiper.activeIndex)

            // fixes desync with thumbsSwiper active img color opacity class
            if(thumbsSwiper != null && thumbsSwiper!=undefined && !thumbsSwiper.destroyed){
                thumbsSwiper.activeIndex = currswiper.activeIndex;
                thumbsSwiper.updateSlidesClasses();
            }
                
        }
    }

    const onDeletePhoto = async (imagePath: string) => { 
        const { value } = await Dialog.confirm({
            title: 'Confirm Delete',
            message: `Are you sure you'd like to delete this file?`,
          });

        if(value == true){
            // if first photo and list has more, go next
            if(activeIndex == 0 && (mainSwiper?.slides?.length ?? 0) > 1){ 
                mainSwiper?.slideNext()
            }
            // if last photo and list has more, go prev
            else if(activeIndex == ((mainSwiper?.slides?.length ?? 0) - 1) && (mainSwiper?.slides?.length ?? 0) > 1){ 
                mainSwiper?.slidePrev()
            }
            else if (mainSwiper?.slides?.length == 1){ // else no more photos, end modal
                props.setIsOpen(false);
            }
            else{
                mainSwiper?.slideNext()
            }

            await deletePhoto(imagePath);
        }
    }

    const onSharePhoto = async (fileURL: string) => {
        const splitURL = fileURL.split('/');
        const filename = splitURL[splitURL.length - 1]

        const filehandle = await Filesystem.getUri({path: filename, directory: Directory.Data});
        let shared = await Share.share({
          files: [filehandle.uri]
        });
      }

    return (
    <>
        <div className="master-grid">
        {!isViewingPhoto? <span></span> :
        <>
        { showToolbox && 
            <span
            className={`toolbox ${showToolbox? 'toolbox-show':''}`}
            style={{
                position: "absolute",
                top: '0px',
                color: 'rgb(0, 122, 255)',
                background: "rgba(28, 28, 30, 0.5)",   
                width: '100vw',
                zIndex: 20
            }}>
                <IonIcon icon={chevronBackOutline} size="large" style={{position: "relative", top: '15px', height: '8vh'}}></IonIcon>
            </span>
        }

        { thumbsSwiper != null && thumbsSwiper != undefined &&
        <Swiper
            style={{
                background: 'transparent',
            }}
            initialSlide={ props.startIndex ?? activeIndex ?? 0}
            onSwiper={(x) => setMainSwiper(x)}
            effect={"slide"}
            slideToClickedSlide={true}
            zoom={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation={true}
            onClick={onClick}
            modules={[Zoom, Navigation, Pagination, Thumbs, Virtual]}
            onZoomChange={onZoomChange}
            onSlideChange={onSlideChange} 
            className={`mySwiper2 ${showToolbox? "mySwiper2powerslide" : ""}`}
            virtual={isVirtual}
        >
            {mediaItems.map((x, y) =>
            {
                return (
                <SwiperSlide key={x} virtualIndex={y} style={{margin: '0px'}} zoom={true} className={"swiper-zoom-container"}>
                {
                (x.endsWith(".jpeg"))? 
                    <img src={x} loading="lazy" style={{objectFit: 'contain', width: 'auto', height: '100%'}} className={"swiper-zoom-target"} />
                    :
                    // <video src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} className={"swiper-zoom-target"}  /> 
                    <video preload="metadata" style={{objectFit: 'cover', width: '100vw', height: 'auto', minHeight: 'auto', minWidth: '100vw'}} controls>
                      <source src={x + + '#t=0.5'} type="video/mp4" />
                    </video>
                }
                </SwiperSlide>
                )
            }
            )}    
        </Swiper>
        }

        {/* Thumbnail reel */}
        <Swiper
            onSwiper={(x) => setThumbsSwiper(x)}
            initialSlide={ props.startIndex ?? activeIndex ?? 0}
            centeredSlides={true}
            slideToClickedSlide={true}
            centeredSlidesBounds={true}
            centerInsufficientSlides={true}
            spaceBetween={0}
            slidesPerView={'auto'}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            style={{height: '100px'}}
            className={`thumbnailGallery ${showToolbox? "thumbnailGalleryPowerSlide" : ""}`}
            onSlideChange={(x) => onSlideChange(x, true)} 
            onClick={(x) => {
                //console.log('x.activeIndex', x.activeIndex)
            }}
        >
            {mediaItems.map((x, y) =>
                {
                    return (
                        <SwiperSlide key={x}
                        style={{height: '50px', position: 'relative', bottom: '0px', width: 'auto'}}
                        >
                                {
                                    (x.endsWith(".jpeg"))? 
                                        <img src={x} loading="lazy" style={{objectFit: 'cover', width: 'auto', height: '100%'}} />
                                        :
                                        <video preload="metadata" style={{objectFit: 'cover', width: 'auto', height: '100%'}}>
                                            <source src={x + + '#t=0.5'} type="video/mp4" />
                                        </video>
                                }
                        </SwiperSlide>
                    )
                })}   
                
                <div style={{position: 'absolute', bottom: '0', zIndex: '20'}} className={"ionToolbar"}>
                    <IonButtons slot="start">
                        <IonButton onClick={async() => await onSharePhoto(mediaItems[activeIndex])}><IonIcon icon={shareOutline}></IonIcon></IonButton>
                    </IonButtons>
                    
                    <IonButtons slot="end">
                        <IonButton onClick={async() => await onDeletePhoto(mediaItems[activeIndex])}><IonIcon icon={trashOutline}></IonIcon></IonButton>
                    </IonButtons>
                </div>
        </Swiper>
        </>
        }
        </div>
    </>
  );
}
