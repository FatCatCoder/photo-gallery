import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal, IonItem, IonList, IonGrid, IonRow, IonCol, IonImg } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';
// import PhotoViewer from '../components/PhotoViewer';
import { useRef, useState } from 'react';
import PhotoSwipe from '../components/PhotoSwipe';



const Tab1: React.FC = () => {
  const imageList = [
    {url: 'https://i.ibb.co/wBYDxLq/beach.jpg', title: 'Beach Houses'},
  ];

  const [images, setImages] = useState([
    "assets/flowers.jpg",
    "https://images.unsplash.com/photo-1676107983201-041c63f0012a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    "https://swiperjs.com/demos/images/nature-1.jpg",
    "https://swiperjs.com/demos/images/nature-2.jpg"
]);
  
// const options: any = {};
// // options.title = false;
// // options.share = false;
// // options.transformer = "depth";
// // options.spancount = 2
// options.maxzoomscale = 3;
// options.compressionquality = 0.6;
// options.backgroundcolor = 'white';

const [isOpen, setIsOpen] = useState(false);  
// const [imageIndex, setImageIndex] = useState(-1);
// const [message, setMessage] = useState("");

// const handleOnExit = async (args: any) => {
//   try {
//     if(args[1] != null) setImageIndex(args[1]);
//     if(args[2] != null) setMessage(args[2]);
//     setIsOpen(false);
//   }
//   catch (error) {
//     console.log(error);
//   }
  
// }

// const renderOutput = () => {
//   if(imageIndex != -1 || message.length > 0) {

//     if(imageIndex != -1) {
//       return (
//         <div>
//           <p>last selected image {imageIndex}</p>
//         </div>
//       )
//     } else {
//       return (
//         <div>
//           <p>Error: {message}</p>
//         </div>
//       )
//     }
//   } else {
//     return null;
//   }

// }

// const renderComponent = () => {
//   if(isOpen)
//   {
//     let attachment : any= {};
//     let mode = "one";
//     let startFrom = 0;

//     if (mode === "one" || mode === "slider") {
//       if(startFrom == null) return null;
//       options.title = false;
//       attachment.startFrom = startFrom;
//     } 
//     else if (mode === "gallery") {
//       options.title = true;
//       options.spancount = 3;
//     }

//     attachment.imageList = imageList;
//     attachment.mode = mode;
//     attachment.options = options;

//     return (
//         <>
//         {isOpen? <PhotoViewer attachment={attachment} onExit={handleOnExit}></PhotoViewer> : <div>asd</div>}
//         </>
//     )
//   }
//   else{
//     return <div>qwe</div>;
//   }
//   }  

  const modal = useRef<HTMLIonModalElement>(null);
  function dismiss() {
    setIsOpen(false);
    modal.current?.dismiss();
  }

  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader> */}
      <IonContent fullscreen scrollY={false}>
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader> */}
       
        {/* <IonButton onClick={() => setIsOpen(true)}>Open</IonButton>

        {renderOutput()}
        
        {isOpen? renderComponent(): <span>Click To View</span>} */}

        <PhotoSwipe></PhotoSwipe>

          {/* <IonGrid>
            <IonRow>
            {images.map((image) => {
              return (
                <IonCol>
                    <IonImg src={image} onClick={() => setIsOpen(true)} />
                </IonCol>
              )
            })}
          </IonRow>
        </IonGrid>

        <IonButton id="open-custom-dialog" expand="block" onClick={() => setIsOpen(true)}>
          Open Custom Dialog
        </IonButton>

        <IonModal id="example-modal" isOpen={isOpen} onClick={dismiss} ref={modal} trigger="open-custom-dialog">
          <PhotoSwipe></PhotoSwipe>
        </IonModal> */}

      </IonContent>
    </IonPage>
  );
};

export default Tab1;
