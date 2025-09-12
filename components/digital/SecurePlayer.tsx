import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface SecurePlayerProps {
    kind: 'AUDIO' | 'VIDEO';
    src: string;
}

const SecurePlayer: React.FC<SecurePlayerProps> = ({ kind, src }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Anti-copy: Disable context menu
        const preventDefault = (e: Event) => e.preventDefault();
        const el = containerRef.current;
        if (el) {
            el.addEventListener('contextmenu', preventDefault);
        }

        // HLS.js setup for video
        let hls: Hls | null = null;
        if (kind === 'VIDEO' && videoRef.current) {
            const videoElement = videoRef.current;
            if (Hls.isSupported()) {
                console.log('HLS.js is supported, initializing...');
                hls = new Hls();
                hls.loadSource(src);
                hls.attachMedia(videoElement);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('HLS fatal network error encountered, trying to recover');
                                hls?.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('HLS fatal media error encountered, trying to recover');
                                hls?.recoverMediaError();
                                break;
                            default:
                                console.error('HLS fatal error, cannot recover');
                                hls?.destroy();
                                break;
                        }
                    }
                });
            } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                console.log('Native HLS is supported.');
                videoElement.src = src;
            }
        }

        return () => {
            if (el) {
                el.removeEventListener('contextmenu', preventDefault);
            }
            if (hls) {
                console.log('Destroying HLS.js instance.');
                hls.destroy();
            }
        };
    }, [kind, src]);

    return (
        <div ref={containerRef} className="bg-black border border-gray-700 rounded-lg overflow-hidden select-none">
            {kind === 'VIDEO' ? (
                <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload"
                    className="w-full aspect-video"
                    poster="https://durian.blender.org/wp-content/uploads/2010/06/Sintel_poster_1080p_latest.jpg"
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="p-4">
                     <audio
                        controls
                        controlsList="nodownload"
                        className="w-full"
                        src={src}
                    >
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default SecurePlayer;