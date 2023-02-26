import { useRef, useEffect } from 'react';
import { register } from 'swiper/element/bundle';

register();

export const PhotoSwiperTwo = (props) => {
  const swiperElRef = useRef(null);

  useEffect(() => {
    // listen for Swiper events using addEventListener
    swiperElRef.current.addEventListener('progress', (e) => {
      const [swiper, progress] = e.detail;
      console.log(progress);
    });

    swiperElRef.current.addEventListener('slidechange', (e) => {
      console.log('slide changed');
    });
  }, []);

  return (
    <>
    <swiper-container
      ref={swiperElRef}
      slides-per-view="3"
      navigation="true"
      pagination="true"
      class="mySwiper"
      thumbs-swiper=".mySwiper2"
    >
      {props.media.map((x, y) =>
      {
        return (
          <swiper-slide key={x} style={{margin: '0px'}} className={"swiper-zoom-container"}>
          {
          (x.endsWith(".jpeg"))? 
              <img src={x} loading="lazy" style={{objectFit: 'cover', width: 'auto', height: '100%'}} className={"swiper-zoom-target"} />
              :
              <video src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}} className={"swiper-zoom-target"}  /> 
          }
          </swiper-slide>
          )
      }
      )}   
    </swiper-container>

    <swiper-container class="mySwiper2">
    {props.media.map((x, y) =>
      {
        return (
          <swiper-slide key={x} style={{margin: '0px'}}>
          {
          (x.endsWith(".jpeg"))? 
              <img src={x} loading="lazy" style={{objectFit: 'cover', width: 'auto', height: '100%'}}  />
              :
              <video src={x} style={{objectFit: 'cover', width: 'auto', height: '100%'}}  /> 
          }
          </swiper-slide>
          )
      }
      )} 
   </swiper-container>
</>
  );
};