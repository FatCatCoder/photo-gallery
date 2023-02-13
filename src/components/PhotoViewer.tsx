import React, {useEffect} from 'react';
import usePhotoViewer from '../hooks/usePhotoViewer'

const PhotoViewer = (props: any) => {
    const onExit = ([...args]) => {
        props.onExit([...args])
    }
    
    const pvHook = usePhotoViewer({onExit});
    useEffect( () => {
        const showPhotoViewer = async () => {
            const imageList = props.attachment.imageList;
            const options = props.attachment.options;
            const mode = props.attachment.mode;
            const startFrom = props.attachment.startFrom;
            const ret = await pvHook.show(imageList, mode, startFrom, options);
        };
        showPhotoViewer();
    });
    
    return (
        <div id="photoviewer-container" slot="fixed"></div>
    )
}
export default PhotoViewer