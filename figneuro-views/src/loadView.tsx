import { ViewComponentProps } from "@figurl/core-views"
import { FunctionComponent } from "react"
import { isTimeseriesGraphViewData, TimeseriesGraphView } from "@figurl/timeseries-views"
import { AudioSpectrogramView, isAudioSpectrogramViewData } from "./saneslab/view-audio-spectrogram"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isTimeseriesGraphViewData(data)) {
        return <TimeseriesGraphView data={data} width={width} height={height} />
    }
    else if (isAudioSpectrogramViewData(data)) {
        return <AudioSpectrogramView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView