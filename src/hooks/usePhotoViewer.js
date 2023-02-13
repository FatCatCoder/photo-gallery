import { useCallback, useEffect } from 'react';
import { PhotoViewer } from '@capacitor-community/photoviewer';


const usePhotoViewer = ({onExit}) => {
    const vpPlugin = PhotoViewer;
    useEffect(async () => {
        let exitListener = null;
        if(onExit && vpPlugin) {
            exitListener = await vpPlugin.addListener('jeepCapPhotoViewerExit',
            (e) => {
                const keys = Object.keys(e);
                let args = []
                if(keys.includes("result")) {
                    args = [...args, e.result];
                    if(e.result && keys.includes("imageIndex")) {
                        args = [...args, e.imageIndex];
                    } else {
                        args = [...args, null];
                    }
                }
                if(keys.includes("message")) {
                    args = [...args, e.message];
                } else {
                    args = [...args, null];
                }
                onExit([...args]);
            });
        }
        return () => {
            if(exitListener) exitListener.remove();
        }
    }, []);        
    const echo = useCallback(async (value) => {
        if (value) {
            const r = await vpPlugin.echo({value});
            if (r) {
                return r;
            }
            else {
                return { value: null };
            }
        }
        else {
            return { value: null };
        }
    }, []);
    const show = useCallback(async (images, mode, startFrom, options) => {
        if (images == null || images.length === 0) {
            return Promise.reject(new Error('Must provide an image or an image Array '));
        }
        let opts = {images: images, mode: mode, startFrom: startFrom};

        if (options != null && Object.keys(options).length != 0 ) {
            opts.options = options;
        }
        const r = await vpPlugin.show(opts);
        if (r) {
            if(r.result) {
                return r
            } else {
                return Promise.reject(new Error(`Show: ${r.message}`));
            }
        } else {
            return Promise.reject(new Error('Show: No result returned'));
        }

    }, []);
    return { echo, show };
}
export default usePhotoViewer;