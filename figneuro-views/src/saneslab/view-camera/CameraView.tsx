import { useTimeseriesSelection, useTimeseriesSelectionInitialization } from "@figurl/timeseries-views"
import { FunctionComponent, useEffect } from "react"
import { CameraViewData } from "./CameraViewData"
import CameraWidget from "./CameraWidget"

type Props = {
	data: CameraViewData
	width: number
	height: number
}

const CameraView: FunctionComponent<Props> = ({data, width, height}) => {
	const {samplingFrequency, videoUri, videoWidth, videoHeight, videoNumFrames} = data
    const {currentTime, setCurrentTime} = useTimeseriesSelection()
    useTimeseriesSelectionInitialization(0, samplingFrequency * videoNumFrames)
    useEffect(() => {
        if (currentTime === undefined) {
            setTimeout(() => setCurrentTime(0), 1) // for some reason we need to use setTimeout for initialization - probably because we are waiting for useTimeseriesSelectionInitialization
        }
    }, [currentTime, setCurrentTime])
	return (
        <CameraWidget
            width={width}
            height={height}
            videoUri={videoUri}
            videoWidth={videoWidth}
            videoHeight={videoHeight}
            videoNumFrames={videoNumFrames}
            samplingFrequency={samplingFrequency}
        />
    )
}

export default CameraView
