import React, { useEffect, useRef, useState } from "react";

// Import Swiper React components
import { Zoom, Navigation, Pagination, FreeMode, Thumbs } from "swiper";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { IonIcon, IonGrid, IonCol, IonRow, IonImg, IonToolbar, IonButton, IonButtons } from "@ionic/react";
import { chevronBackOutline, shareOutline, trashOutline } from 'ionicons/icons';
import { isPlatform } from '@ionic/react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useGlobalStore } from '../GlobalStore';

// Import Swiper styles
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
import './PhotoSwipe.css';
import { on } from "events";


export default function PhotoSwipe(props) {  
    const isZoomed = useGlobalStore((state) => state.isZoomed)
    const setIsZoomed = useGlobalStore((state) => state.setIsZoomed)

    const thumbnailSwiperRef = useRef(null);    
    const [showToolbox, setShowToolbox] = useState(false);
    const [isViewingPhoto, setIsViewingPhoto] = useState(true);
    const [mediaItems, setMediaItems] = useState([]);
    const [mainSwiper, setMainSwiper] = useState();
    const [thumbsSwiper, setThumbsSwiper] = useState();
    const [activeIndex, setActiveIndex] = useState(0);


    useEffect(() => {
        setMediaItems(props.media)
        // setThumbsSwiper(thumbnailSwiperRef.current)
    }, []); 

    useEffect(() => {
        try {
            if(thumbsSwiper != null && thumbsSwiper !=undefined && !thumbsSwiper.destroyed)
            thumbsSwiper.activeIndex = activeIndex;

            // if(mainSwiper != null && mainSwiper !=undefined && !mainSwiper.destroyed)
            // mainSwiper.activeIndex = activeIndex;

        

        } catch (error) {
            console.log(error)  
        }
    }, [])

    const onClick = (e) => {
        setShowToolbox(!showToolbox)

        if(!isPlatform("mobileweb") || !isPlatform("desktop")){
            StatusBar.getInfo().then(info => info.visible? StatusBar.hide(): StatusBar.show()); 
        }

        //
        // // TODO: convert to a function which is called only after there has been no user interaction for the duration
        //
        // setTimeout(() => { 
        //     if(!isShowingToolbox()){
        //         setShowToolbox(false)
        //     }
        // }, 2500);
    }
    const isShowingToolbox = () => { // just to make sure we capture the correct scope value
        return showToolbox;
    }

    const onZoomChange = (swiper, scale, imageEl, slideEl)  => {
        if(scale != 1){
            setIsZoomed(true)
        }  
        else{
            setIsZoomed(false)
        }
    }

    const onSlideChange = (currswiper) => {
        console.log(currswiper.activeIndex)
        

        if(activeIndex != currswiper.activeIndex){
            setActiveIndex(currswiper.activeIndex)

            try {
                //thumbsSwiper.activeIndex = currswiper.activeIndex;  
                //thumbsSwiper.slideTo(currswiper.activeIndex)

                mainSwiper.activeIndex = currswiper.activeIndex;
                mainSwiper.slideTo(currswiper.activeIndex);


                
            } catch (error) {
                console.log(error)  
            }
        }
    }

    return (
    <>
        <div className="master-grid">
        {!isViewingPhoto? <span></span> :
        <>
        {showToolbox && 
            <span
            className="toolbox toolbox-show"
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
            initialSlide={ props.startIndex ?? 0}
            swiper={(x) => setMainSwiper(x)}
            effect={"fade"}
            // centeredSlides={true}
            // centeredSlidesBounds={true}
            slideToClickedSlide={true}
            zoom={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            navigation={false}
            onClick={onClick}
            // onSlideChange={onSlideChange} 
            modules={[Zoom, Navigation, Pagination, Thumbs, FreeMode]}
            onZoomChange={onZoomChange}
            className={`mySwiper2 ${showToolbox? "mySwiper2powerslide" : ""}`}
        >
            {mediaItems.map((x, y) =>
                {
                    return (
                        <SwiperSlide key={x} virtualIndex={y} style={{margin: '0px'}} className="swiper-zoom-container">
                            
                            {
                                (x.endsWith(".jpeg"))? 
                                    <img src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} class="swiper-zoom-target" />
                                    :
                                    <video src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} class="swiper-zoom-target"  /> 
                            }
                            
                        </SwiperSlide>
                    )
                })}    
        </Swiper>
}

        {/* Thumbnail reel */}
        <Swiper
            initialSlide={ props.startIndex ?? 0}
            centeredSlides={true}
            onSwiper={(x) => setThumbsSwiper(x)}
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
            onSlideChange={onSlideChange} 
            onClick={(x) => {
                console.log('x.activeIndex', x.activeIndex)
                
                // mainSwiper.slideTo(x.clickedIndex)
                // thumbsSwiper.slideTo(x.activeIndex)
            }}
        >
            {mediaItems.map((x,y) =>
                {
                    return (
                        <SwiperSlide key={x} virtualIndex={y} zoom={true} className="swiper-zoom-container"
                        style={{height: '50px', position: 'relative', bottom: '0px', width: 'auto'}}
                        >
                                {
                                    (x.endsWith(".jpeg"))? 
                                        <img src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} />
                                        :
                                        <video src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} /> 
                                }
                        </SwiperSlide>
                    )
                })}   
                
                <div style={{position: 'absolute', bottom: '0', zIndex: '20'}} className={"ionToolbar"}>
                    <IonButtons slot="start">
                        <IonButton><IonIcon icon={shareOutline}></IonIcon></IonButton>
                    </IonButtons>
                    
                    <IonButtons slot="end">
                        <IonButton><IonIcon icon={trashOutline}></IonIcon></IonButton>
                    </IonButtons>
                </div>
        </Swiper>
        </>
        }
        </div>
    </>
  );
}
