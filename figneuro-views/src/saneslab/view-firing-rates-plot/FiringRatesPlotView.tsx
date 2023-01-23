import { idToNum, useSelectedUnitIds } from '@figurl/spike-sorting-views'
import { DefaultToolbarWidth, TimeScrollView, usePanelDimensions, useTimeRange, useTimeseriesMargins, useTimeseriesSelectionInitialization } from '@figurl/timeseries-views'
import { FunctionComponent, useCallback, useMemo } from 'react'
import { FiringRatesPlotViewData } from './FiringRatesPlotViewData'

type Props = {
    data: FiringRatesPlotViewData
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
    width: number
    height: number
}

export type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

type PanelProps = {
    segments: {
        t1: number
        t2: number
        firingRate: number
    }[]
}

const panelSpacing = 4

const FiringRatesPlotView: FunctionComponent<Props> = ({data, timeseriesLayoutOpts, width, height}) => {
    const {selectedUnitIds} = useSelectedUnitIds()

    useTimeseriesSelectionInitialization(data.startTimeSec, data.endTimeSec)
    const { visibleStartTimeSec, visibleEndTimeSec } = useTimeRange()

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)

    // Compute the per-panel pixel drawing area dimensions.
    const panelCount = useMemo(() => data.plots.length, [data.plots])
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth
    const { panelWidth, panelHeight } = usePanelDimensions(width - toolbarWidth, height, panelCount, panelSpacing, margins)

    const binSizeSec = 0.1
    const smoothingRadius = 1
    const numBins = useMemo(() => (Math.ceil(data.endTimeSec - data.startTimeSec) / binSizeSec), [data.startTimeSec, data.endTimeSec])
    const firingRatePlots: {
        unitId: number | string
        spikeCounts: number[]
    }[] = useMemo(() => (
        data.plots.sort((p1, p2) => (idToNum(p1.unitId) - idToNum(p2.unitId))).map(plot => {
            const spikeCounts: number[] = []
            for (let i = 0; i < numBins; i++) {
                spikeCounts.push(0)
            }
            for (let t of plot.spikeTimesSec) {
                const b = Math.floor((t - data.startTimeSec) / binSizeSec)
                spikeCounts[b] += 1
            }
            const spikeCountsSmoothed: number[] = []
            for (let i = 0; i < numBins; i++) {
                spikeCountsSmoothed.push(computeMean(spikeCounts.slice(Math.max(i - smoothingRadius, 0), Math.min(i + smoothingRadius + 1, numBins))))
            }
            return {
                unitId: plot.unitId,
                spikeCounts: spikeCountsSmoothed
            }
        })
    ), [data.plots, data.startTimeSec, numBins])

    const paintPanel = useCallback((context: CanvasRenderingContext2D, props: PanelProps) => {
        if ((visibleStartTimeSec === undefined) || (visibleEndTimeSec === undefined)) return
        for (let seg of props.segments) {
            context.fillStyle = firingRateToColor(seg.firingRate)
            const x1 = (seg.t1 - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec) * panelWidth
            const x2 = (seg.t2 - visibleStartTimeSec) / (visibleEndTimeSec - visibleStartTimeSec) * panelWidth
            context.fillRect(
                x1, 0, x2, Math.max(panelHeight, 1)
            )
        }
    }, [panelHeight, panelWidth, visibleStartTimeSec, visibleEndTimeSec])

    const panels = useMemo(() => (firingRatePlots.map(plot => {
        const i1 = Math.max(0, Math.floor((visibleStartTimeSec || 0) / binSizeSec - 1))
        const i2 = Math.min(numBins, Math.ceil((visibleEndTimeSec || 0) / binSizeSec + 1))
        const segments: {
            t1: number
            t2: number
            firingRate: number
        }[] = []

        for (let ii = i1; ii < i2; ii++) {
            const sc = plot.spikeCounts[ii]
            segments.push({
                t1: data.startTimeSec + ii * binSizeSec,
                t2: data.startTimeSec + (ii + 1) * binSizeSec,
                firingRate: sc / binSizeSec
            })
        }

        const panelProps: PanelProps = {
            segments
        }

        return {
            key: `${plot.unitId}`,
            label: `${plot.unitId}`,
            props: panelProps,
            paint: paintPanel
        }
    })), [firingRatePlots, visibleStartTimeSec, visibleEndTimeSec, paintPanel, data.startTimeSec, numBins])

    return visibleStartTimeSec === undefined
    ? (<div>Loading...</div>)
    : (
        <TimeScrollView
            margins={margins}
            panels={panels}
            panelSpacing={panelSpacing}
            selectedPanelKeys={selectedUnitIds}
            timeseriesLayoutOpts={timeseriesLayoutOpts}
            width={width}
            height={height}
        />
    )
}

function computeMean(a: number[]) {
    return a.reduce((v, prev) => (v + prev), 0) / a.length
}

function firingRateToColor(f: number) {
    const a = Math.min(1, f / 30)
    return heatMapColorforValue(a, a)
}

// https://stackoverflow.com/questions/12875486/what-is-the-algorithm-to-create-colors-for-a-heatmap
function heatMapColorforValue(value: number, saturation: number) {
    var h = Math.floor((1.0 - value) * 240)
    return `hsl(${h},${Math.floor(saturation * 100)}%,50%)`;
    // 0    : blue   (hsl(240, 100%, 50%))
    // 0.25 : cyan   (hsl(180, 100%, 50%))
    // 0.5  : green  (hsl(120, 100%, 50%))
    // 0.75 : yellow (hsl(60, 100%, 50%))
    // 1    : red    (hsl(0, 100%, 50%))
}

export default FiringRatesPlotView