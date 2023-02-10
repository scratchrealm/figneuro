import { useTimeseriesSelection, useTimeseriesSelectionInitialization } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect } from "react"
import { AnnotatedVideoViewData } from "./AnnotatedVideoViewData"
import AnnotatedVideoWidget from "./AnnotatedVideoWidget"

type Props = {
	data: AnnotatedVideoViewData
	width: number
	height: number
}

const AnnotatedVideoView: FunctionComponent<Props> = ({data, width, height}) => {
	const {samplingFrequency, videoUri, videoWidth, videoHeight, videoNumFrames, annotationsUri} = data
    const {currentTime, setCurrentTime} = useTimeseriesSelection()
    useTimeseriesSelectionInitialization(0, samplingFrequency * videoNumFrames)
    useEffect(() => {
        if (currentTime === undefined) {
            setTimeout(() => setCurrentTime(0), 1) // for some reason we need to use setTimeout for initialization - probably because we are waiting for useTimeseriesSelectionInitialization
        }
    }, [currentTime, setCurrentTime])
	return (
        <AnnotatedVideoWidget
            width={width}
            height={height}
            videoUri={videoUri}
            annotationsUri={annotationsUri}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            videoNumFrames={videoNumFrames}
            samplingFrequency={samplingFrequency}
        />
    )
}

export default AnnotatedVideoView
