import React, { useEffect, useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { IonIcon, IonGrid, IonCol, IonRow } from "@ionic/react";
import { arrowBack } from 'ionicons/icons';

// Import Swiper styles
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import "swiper/css/thumbs";

import './PhotoSwipe.css';

// import required modules
import { Zoom, Navigation, Pagination, FreeMode, Thumbs } from "swiper";


export default function PhotoSwipe() {  
    const sref = useRef();
    const [isViewingPhoto, setIsViewingPhoto] = useState(true);
    const [images, setImages] = useState([
        "assets/flowers.jpg",
        "https://images.unsplash.com/photo-1676107983201-041c63f0012a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
        "https://swiperjs.com/demos/images/nature-1.jpg",
        "https://swiperjs.com/demos/images/nature-2.jpg"
    ]);

    useEffect(() => {
        if(isViewingPhoto == false){
            setTimeout(() => setIsViewingPhoto(true), 2000)
        }
        // if(images.count() === 0){
        // setImages(props.Images);
        // }
    })
    
    let isSwiped = false;
    let initialX = 0;
    let initialY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let diffThreashold = 8;

    const getXY = (s, e) => {
        mouseX = (s.touches.currentX) - e.clientX;
        mouseY = (s.touches.currentY) - e.clientY;
    };

    const onTouchStart = (s, e) => {
        let bottomStart = ((s.touches.startY / s.height) * 100);

        if(bottomStart >= 90)
        {
            isSwiped = true;
            getXY(s, e);
            initialX = mouseX;
            initialY = mouseY;
        }
    }
    const onTouchEnd = (s, e) => {
        isSwiped = false;
    }

    const onTouchMove = (s, e) => {
          if (isSwiped) {
            getXY(s, e);
            let diffX = mouseX - initialX;
            let diffY = mouseY - initialY;
            
            console.log(Math.abs(diffY), diffThreashold)
            if (Math.abs(diffY) >= diffThreashold && Math.abs(diffY) > Math.abs(diffX)) {
              (diffY > 0) ? setIsViewingPhoto(false) : console.log("Up");
            } 
            // else {
            //   diffX > 0 ? console.log("Right") :console.log( "Left");
            // }
          }
    }

    const onClick = (e) => {
        setShowToolbox(!showToolbox)
    }
    const [showToolbox, setShowToolbox] = useState(false);

  return (
    <>
    <div className="master-grid">
    {showToolbox && 
        <span
        style={{
            position: "absolute",
            top: '0px',
            color: 'blue',
            background: "rgba(0, 0, 0, 0.5)",
            width: '100vw',
            minHeight: '175px !important',
            height: '175px !important',
            zIndex: 20
        }}>
            <IonIcon icon={arrowBack} size="large"></IonIcon>
        </span>
    }

    {!isViewingPhoto? <span></span> :
    <>
      <Swiper
        style={{
            background: 'transparent',
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        effect={"fade"}
        zoom={true}
        thumbs={{ swiper: sref }}
        navigation={false}
        pagination={{
            dynamicBullets: true,
            dynamicMainBullets: 1,
            clickable: true,
        }}
        onClick={onClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        modules={[Zoom, Navigation, Pagination]}
        className={`mySwiper2 ${showToolbox? "mySwiper2powerslide" : ""}`}
      >
        {images.map(x =>
            {
                return (
                    <SwiperSlide key={x}>
                        <div className="swiper-zoom-container">
                            <img src={x} style={{height: "100vh !important", width: "100vw !important"}} />
                        </div>
                    </SwiperSlide>
                )
            })}    
      </Swiper>
      <Swiper
      ref={sref}
        style={{
          "--swiper-navigation-color": "#fff",
          "--swiper-pagination-color": "#fff",
        }}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className={`mySwiper ${showToolbox? "mySwiperpowerslide" : ""}`}
      >
        {images.map(x =>
            {
                return (
                    <SwiperSlide key={x}>
                        <div className="swiper-zoom-container">
                            <img src={x} />
                        </div>
                    </SwiperSlide>
                )
            })}    
      </Swiper>
      
      
      </>
    }
    </div>
    </>
  );
}
