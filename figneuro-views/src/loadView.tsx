import { ViewComponentProps } from "@figurl/core-views"
import { FunctionComponent } from "react"
import { isTimeseriesGraphViewData, TimeseriesGraphView } from "@figurl/timeseries-views"
import { AudioSpectrogramView, isAudioSpectrogramViewData } from "./saneslab/view-audio-spectrogram"
import { SparseAudioSpectrogramView, isSparseAudioSpectrogramViewData } from "./saneslab/view-sparse-audio-spectrogram"
import { FiringRatesPlotView, isFiringRatesPlotViewData } from "./saneslab/view-firing-rates-plot"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isTimeseriesGraphViewData(data)) {
        return <TimeseriesGraphView data={data} width={width} height={height} />
    }
    else if (isAudioSpectrogramViewData(data)) {
        // obsolete ??
        return <AudioSpectrogramView data={data} width={width} height={height} />
    }
    else if (isSparseAudioSpectrogramViewData(data)) {
        // obsolete ??
        return <SparseAudioSpectrogramView data={data} width={width} height={height} />
    }
    else if (isFiringRatesPlotViewData(data)) {
        return <FiringRatesPlotView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView