import { ViewComponentProps } from "@figurl/core-views"
import { FunctionComponent } from "react"
import { isTimeseriesGraphViewData, TimeseriesGraphView } from "./general/view-timeseries-graph"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isTimeseriesGraphViewData(data)) {
        return <TimeseriesGraphView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView