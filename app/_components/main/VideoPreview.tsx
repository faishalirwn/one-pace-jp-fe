import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    ChangeEvent,
} from "react";

export interface VideoPreviewProps {
    onTimeUpdate?: (currentTime: number) => void;
    isPlaying?: boolean;
}

export interface VideoPreviewRef {
    isPaused: boolean;
    play: () => void;
    pause: () => void;
    setCurrentTime: (time: number) => void;
}

const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(
    ({ onTimeUpdate, isPlaying = false }, ref) => {
        const [videoSrc, setVideoSrc] = useState<string>("");
        const videoRef = useRef<HTMLVideoElement>(null);

        useImperativeHandle(ref, () => ({
            isPaused: videoRef.current?.paused || true,
            play: () => videoRef.current?.play,
            pause: () => videoRef.current?.pause(),
            setCurrentTime: (time: number) => {
                if (videoRef.current) {
                    videoRef.current.currentTime = time;
                }
            },
        }));

        const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
                const blobURL = URL.createObjectURL(file);
                setVideoSrc(blobURL);
            }
        };

        React.useEffect(() => {
            const videoElement = videoRef.current;
            if (videoElement) {
                if (isPlaying) {
                    videoElement.play();
                } else {
                    videoElement.pause();
                }
            }
        }, [isPlaying]);

        // React.useEffect(() => {
        //     const videoElement = videoRef.current;
        //     if (videoElement && onTimeUpdate) {
        //         const handleTimeUpdate = () =>
        //             onTimeUpdate(videoElement.currentTime);
        //         videoElement.addEventListener("timeupdate", handleTimeUpdate);
        //         return () =>
        //             videoElement.removeEventListener(
        //                 "timeupdate",
        //                 handleTimeUpdate
        //             );
        //     }
        // }, [onTimeUpdate]);

        return (
            <div>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="video/*"
                />

                {videoSrc && (
                    <video
                        ref={videoRef}
                        width={320}
                        height={240}
                        controls
                        src={videoSrc}
                    >
                        Your browser does not support the video tag.
                    </video>
                )}
            </div>
        );
    }
);

VideoPreview.displayName = "VideoPreview";

export default VideoPreview;
