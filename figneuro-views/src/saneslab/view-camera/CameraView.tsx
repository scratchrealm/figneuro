import { useTimeseriesSelection } from "@figurl/timeseries-views"
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
    useEffect(() => {
        if (currentTime === undefined) {
            setCurrentTime(0)
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
