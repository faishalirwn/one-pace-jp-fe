import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    ChangeEvent,
    useEffect,
} from "react";

export interface VideoPreviewProps {
    endTime: number;
}

export interface VideoPreviewRef {
    playVideo: () => void;
    pauseVideo: () => void;
    setCurrentTime: (startTime: number) => void;
}

const VideoPreview = forwardRef<VideoPreviewRef, VideoPreviewProps>(
    ({ endTime }, ref) => {
        const [videoSrc, setVideoSrc] = useState<string>("");
        const videoRef = useRef<HTMLVideoElement>(null);

        // Allow parent component to control play functionality
        useImperativeHandle(ref, () => ({
            playVideo() {
                if (videoRef.current) {
                    videoRef.current.play();
                }
            },
            pauseVideo() {
                if (videoRef.current) {
                    videoRef.current.pause();
                }
            },
            setCurrentTime(startTime: number) {
                if (videoRef.current) {
                    videoRef.current.currentTime = startTime; // Start at specified time
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

        useEffect(() => {
            const videoElement = videoRef.current;

            if (videoElement) {
                const handleTimeUpdate = () => {
                    if (videoElement.currentTime >= endTime) {
                        videoElement.pause();
                    }
                };

                videoElement.addEventListener("timeupdate", handleTimeUpdate);

                return () => {
                    videoElement.removeEventListener(
                        "timeupdate",
                        handleTimeUpdate
                    );
                };
            }
        }, [endTime]);

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
