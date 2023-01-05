import React, { useCallback, useContext, useEffect } from 'react'

export type TimeseriesSelection = {
    timeseriesStartTimeSeconds?: number
    timeseriesEndTimeSeconds?: number
    currentTimeSeconds?: number
    currentTimeIntervalSeconds?: [number, number]
    visibleStartTimeSeconds?: number
    visibleEndTimeSeconds?: number
}

export const defaultTimeseriesSelection: TimeseriesSelection = {
}

export const stubTimeseriesSelectionDispatch = (action: TimeseriesSelectionAction) => {}

export const selectionIsValid = (ts: TimeseriesSelection) => {
    // If any of the required times are unset, the state is not valid.
    if (ts.timeseriesStartTimeSeconds === undefined
        || ts.timeseriesEndTimeSeconds === undefined
        || ts.visibleEndTimeSeconds === undefined
        || ts.visibleStartTimeSeconds === undefined) {
            return false
        }
    // timeseries start and end times must be non-negative
    if (ts.timeseriesStartTimeSeconds < 0 || ts.timeseriesEndTimeSeconds < 0) return false
    // timeseries end time must not precede timeseries start time
    if (ts.timeseriesEndTimeSeconds < ts.timeseriesStartTimeSeconds) return false
    // window end time must not precede window start time
    if (ts.visibleEndTimeSeconds < ts.visibleStartTimeSeconds) return false
    // window times must be within timeseries times.
    // Since we already know timeseries start < timeseries end and visible start < visible end,
    // we can get away with just comparing visible start to timeseries start and visible end to timeseries end.
    // (b/c if visEnd < recStart, then visStart < recStart; if visStart > recEnd, then visEnd > recEnd.)
    if (ts.visibleStartTimeSeconds < ts.timeseriesStartTimeSeconds || ts.timeseriesEndTimeSeconds < ts.visibleEndTimeSeconds) return false
    // if (r.currentTimeSeconds) {
    //     // if set, focus time must be within the visible window
    //     if (r.currentTimeSeconds < r.visibleStartTimeSeconds || r.currentTimeSeconds > r.visibleEndTimeSeconds) return false
    // }

    return true
}

type TimeseriesSelectionContextType = {
    timeseriesSelection: TimeseriesSelection,
    timeseriesSelectionDispatch: (action: TimeseriesSelectionAction) => void
}

const TimeseriesSelectionContext = React.createContext<TimeseriesSelectionContextType>({
    timeseriesSelection: defaultTimeseriesSelection,
    timeseriesSelectionDispatch: stubTimeseriesSelectionDispatch
})

export const useTimeseriesInitialization = (start: number, end: number, timeOffset: number=0) => {
    const { timeseriesSelection, timeseriesSelectionDispatch } = useContext(TimeseriesSelectionContext)

    useEffect(() => {
        if (timeseriesSelection.timeseriesStartTimeSeconds === start + timeOffset &&
            timeseriesSelection.timeseriesEndTimeSeconds === end + timeOffset) return

        timeseriesSelectionDispatch({
            type: 'initializeTimeseriesSelectionTimes',
            timeseriesStartSec: start + timeOffset,
            timeseriesEndSec: end + timeOffset
        })
    }, [timeseriesSelection.timeseriesStartTimeSeconds, timeseriesSelection.timeseriesEndTimeSeconds, timeseriesSelectionDispatch, start, end, timeOffset])
}

export type ZoomDirection = 'in' | 'out'
export type PanDirection = 'forward' | 'back'
export const useTimeRange = (timestampOffset=0) => {
    const {timeseriesSelection, timeseriesSelectionDispatch} = useContext(TimeseriesSelectionContext)
    if (timeseriesSelection.visibleEndTimeSeconds === undefined || timeseriesSelection.visibleStartTimeSeconds === undefined) {
        console.warn('WARNING: useTimeRange() with uninitialized timeseries selection state. Time ranges replaced with MIN_SAFE_INTEGER.')
    }
    const zoomTimeseriesSelection = useCallback((direction: ZoomDirection, factor?: number) => {
        timeseriesSelectionDispatch({
            type: direction === 'in' ? 'zoomIn' : 'zoomOut',
            factor
        })
    }, [timeseriesSelectionDispatch])
    const panTimeseriesSelection = useCallback((direction: PanDirection, pct?: number) => {
        timeseriesSelectionDispatch({
            type: direction === 'forward' ? 'panForward' : 'panBack',
            panAmountPct: pct ?? defaultPanPct
        })
    }, [timeseriesSelectionDispatch])
    const panTimeseriesSelectionDeltaT = useCallback((deltaT: number) => {
        timeseriesSelectionDispatch({
            type: 'panDeltaT',
            deltaT
        })
    }, [timeseriesSelectionDispatch])
    const setVisibleTimeRange = useCallback((startTimeSec: number, endTimeSec: number) => {
        timeseriesSelectionDispatch({
            type: 'setVisibleTimeRange',
            startTimeSec,
            endTimeSec
        })
    }, [timeseriesSelectionDispatch])
    return {
        visibleStartTimeSeconds: timeseriesSelection.visibleStartTimeSeconds !== undefined ? timeseriesSelection.visibleStartTimeSeconds - timestampOffset : undefined,
        visibleEndTimeSeconds: timeseriesSelection.visibleEndTimeSeconds !== undefined ? timeseriesSelection.visibleEndTimeSeconds - timestampOffset : undefined,
        zoomTimeseriesSelection,
        panTimeseriesSelection,
        panTimeseriesSelectionDeltaT,
        setVisibleTimeRange
    }
}

export const useTimeseriesSelection = () => {
    const {timeseriesSelection, timeseriesSelectionDispatch} = useContext(TimeseriesSelectionContext)
    const timeForFraction = useCallback((fraction: number) => {
        const window = (timeseriesSelection.visibleEndTimeSeconds || 0) - (timeseriesSelection.visibleStartTimeSeconds || 0)
        const time = window * fraction
        return time + (timeseriesSelection.visibleStartTimeSeconds || 0)
    }, [timeseriesSelection.visibleStartTimeSeconds, timeseriesSelection.visibleEndTimeSeconds])
    const setTimeFocus = useCallback((time: number, o: {autoScrollVisibleTimeRange?: boolean}={}) => {
        timeseriesSelectionDispatch({
            type: 'setCurrentTime',
            currentTimeSec: time,
            autoScrollVisibleTimeRange: o.autoScrollVisibleTimeRange
        })
    }, [timeseriesSelectionDispatch])
    const setTimeFocusFraction = useCallback((fraction: number, opts: {event: React.MouseEvent}) => {
        if (fraction > 1 || fraction < 0) {
            console.warn(`Attempt to set time focus to fraction outside range 0-1 (${fraction})`)
            return
        }
    
        timeseriesSelectionDispatch({
            type: 'setCurrentTime',
            currentTimeSec: timeForFraction(fraction),
            shiftKey: opts.event.shiftKey
        })
    }, [timeseriesSelectionDispatch, timeForFraction])
    const currentTimeIsVisible = timeseriesSelection.currentTimeSeconds !== undefined
                               && timeseriesSelection.currentTimeSeconds <= (timeseriesSelection.visibleEndTimeSeconds || 0)
                               && timeseriesSelection.currentTimeSeconds >= (timeseriesSelection.visibleStartTimeSeconds || 0)
    return {
        currentTime: timeseriesSelection.currentTimeSeconds,
        currentTimeIsVisible,
        currentTimeInterval: timeseriesSelection.currentTimeIntervalSeconds,
        setTimeFocus,
        setTimeFocusFraction,
        timeForFraction
    }
}

/* TimeseriesSelection state management code, probably belongs in a different file *********************** */

type InitializeTimeseriesSelectionTimesAction = {
    type: 'initializeTimeseriesSelectionTimes',
    timeseriesStartSec: number,
    timeseriesEndSec: number
}

const defaultPanPct = 10
export const defaultZoomScaleFactor = 1.4

type PanTimeseriesSelectionAction = {
    type: 'panForward' | 'panBack',
    panAmountPct: number    // how far to pan, as a percent of the current visible window (e.g. 10). Should always be positive.
}

type PanTimeseriesSelectionDeltaTAction = {
    type: 'panDeltaT',
    deltaT: number
}

type ZoomTimeseriesSelectionAction = {
    type: 'zoomIn' | 'zoomOut',
    factor?: number // Factor should always be >= 1 (if we zoom in, we'll use the inverse of factor.)
}

type SetVisibleTimeRangeAction = {
    type: 'setVisibleTimeRange',
    startTimeSec: number,
    endTimeSec: number
}

type SetCurrentTimeTimeseriesSelectionAction = {
    type: 'setCurrentTime',
    currentTimeSec: number,
    shiftKey?: boolean
    autoScrollVisibleTimeRange?: boolean
}

type SetCurrentTimeIntervalTimeseriesSelectionAction = {
    type: 'setCurrentTimeInterval',
    currentTimeIntervalSec: [number, number],
    autoScrollVisibleTimeRange?: boolean
}

type SetSelectedElectrodeIdsTimeseriesSelectionAction = {
    type: 'setSelectedElectrodeIds',
    selectedIds: (number | string)[]
}

export type TimeseriesSelectionAction = InitializeTimeseriesSelectionTimesAction  | PanTimeseriesSelectionAction
    | PanTimeseriesSelectionDeltaTAction | ZoomTimeseriesSelectionAction | SetVisibleTimeRangeAction | SetCurrentTimeTimeseriesSelectionAction | SetCurrentTimeIntervalTimeseriesSelectionAction | SetSelectedElectrodeIdsTimeseriesSelectionAction

export const timeseriesSelectionReducer = (state: TimeseriesSelection, action: TimeseriesSelectionAction): TimeseriesSelection => {
    if (action.type === 'initializeTimeseriesSelectionTimes') {
        return initializeTimeseriesSelectionTimes(state, action)
    } else if (action.type === 'panForward' || action.type === 'panBack') {
        return panTime(state, action)
    } else if (action.type === 'panDeltaT') {
        return panTimeDeltaT(state, action)
    } else if (action.type === 'zoomIn' || action.type === 'zoomOut') {
        return zoomTime(state, action)
    } else if (action.type === 'setVisibleTimeRange') {
        return setVisibleTimeRange(state, action)
    } else if (action.type === 'setCurrentTime') {
        return setCurrentTime(state, action)
    } else if (action.type === 'setCurrentTimeInterval') {
        return setCurrentTimeInterval(state, action)
    } else {
        console.warn(`Unhandled timeseries selection action ${action.type} in timeseriesSelectionReducer.`)
        return state
    }
}

const initializeTimeseriesSelectionTimes = (state: TimeseriesSelection, action: InitializeTimeseriesSelectionTimesAction): TimeseriesSelection => {
    const newStart = state.timeseriesStartTimeSeconds === undefined ? action.timeseriesStartSec : Math.min(state.timeseriesStartTimeSeconds, action.timeseriesStartSec)
    const newEnd = state.timeseriesEndTimeSeconds === undefined ? action.timeseriesEndSec : Math.max(state.timeseriesEndTimeSeconds, action.timeseriesEndSec)
    const newState: TimeseriesSelection = {
        timeseriesStartTimeSeconds: newStart,
        timeseriesEndTimeSeconds: newEnd,
        visibleStartTimeSeconds: state.visibleStartTimeSeconds === undefined ? newStart : state.visibleStartTimeSeconds,
        visibleEndTimeSeconds: state.visibleEndTimeSeconds === undefined ? newEnd : state.visibleEndTimeSeconds
    }
    selectionIsValid(newState) || console.warn(`Bad initialization value for timeseriesSelection: start ${action.timeseriesStartSec}, end ${action.timeseriesEndSec}`)
    return newState
}

const panTimeHelper = (state: TimeseriesSelection, panDisplacementSeconds: number) => {
    if (state.visibleStartTimeSeconds === undefined || state.visibleEndTimeSeconds === undefined || state.timeseriesStartTimeSeconds === undefined || state.timeseriesEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const windowLength = state.visibleEndTimeSeconds - state.visibleStartTimeSeconds
    let newStart = state.visibleStartTimeSeconds
    let newEnd = state.visibleEndTimeSeconds
    if (panDisplacementSeconds > 0) {
        // panning forward. Just need to check that we don't run over the end of the timeseries.
        newEnd = Math.min(state.visibleEndTimeSeconds + panDisplacementSeconds, state.timeseriesEndTimeSeconds)
        newStart = Math.max(newEnd - windowLength, state.timeseriesStartTimeSeconds)
    } else if (panDisplacementSeconds < 0) {
        // panning backward. Need to make sure not to put the window start time before the timeseries start time.
        newStart = Math.max(state.visibleStartTimeSeconds + panDisplacementSeconds, state.timeseriesStartTimeSeconds)
        newEnd = Math.min(newStart + windowLength, state.timeseriesEndTimeSeconds)
    } else {
        return state
    }
    const keepFocus = true
    // const keepFocus = state.currentTimeSeconds && state.currentTimeSeconds > newStart && state.currentTimeSeconds < newEnd
    const focus = keepFocus ? state.currentTimeSeconds : undefined

    // Avoid creating new object if we didn't actually change anything
    if (newStart === state.visibleStartTimeSeconds && newEnd === state.visibleEndTimeSeconds) return state

    // console.log(`Returning new state: ${newStart} - ${newEnd} (was ${state.visibleStartTimeSeconds} - ${state.visibleEndTimeSeconds})`)
    return {...state, visibleStartTimeSeconds: newStart, visibleEndTimeSeconds: newEnd, currentTimeSeconds: focus }
}

const panTime = (state: TimeseriesSelection, action: PanTimeseriesSelectionAction): TimeseriesSelection => {
    if (state.visibleStartTimeSeconds === undefined || state.visibleEndTimeSeconds === undefined || state.timeseriesStartTimeSeconds === undefined || state.timeseriesEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const windowLength = state.visibleEndTimeSeconds - state.visibleStartTimeSeconds
    const panDisplacementSeconds = action.panAmountPct / 100 * windowLength * (action.type === 'panBack' ? -1 : 1)
    return panTimeHelper(state, panDisplacementSeconds)
}

const panTimeDeltaT = (state: TimeseriesSelection, action: PanTimeseriesSelectionDeltaTAction): TimeseriesSelection => {
    if (state.visibleStartTimeSeconds === undefined || state.visibleEndTimeSeconds === undefined || state.timeseriesStartTimeSeconds === undefined || state.timeseriesEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call panTime() with uninitialized state ${state}.`)
        return state
    }
    const panDisplacementSeconds = action.deltaT
    return panTimeHelper(state, panDisplacementSeconds)
}

const zoomTime = (state: TimeseriesSelection, action: ZoomTimeseriesSelectionAction): TimeseriesSelection => {
    if (state.visibleStartTimeSeconds === undefined || state.visibleEndTimeSeconds === undefined || state.timeseriesStartTimeSeconds === undefined || state.timeseriesEndTimeSeconds === undefined) {
        console.warn(`WARNING: Attempt to call zoomTime() with uninitialized state ${state}.`)
        return state
    }
    const totalTimeseriesLength = state.timeseriesEndTimeSeconds - state.timeseriesStartTimeSeconds
    const currentWindow = state.visibleEndTimeSeconds - state.visibleStartTimeSeconds

    // short-circuit: if we're trying to zoom out from the full timeseries, just return the current state
    if (currentWindow === totalTimeseriesLength && action.type === 'zoomOut') return state
    // (No such shortcut is available while zooming in--we can always zoom in more.)

    let factor = action.factor ?? defaultZoomScaleFactor
    // zoom in --> shrink the window. zoom out --> expand the window. So when zooming in we use the inverse of the (>=1) factor.
    factor = action.type === 'zoomIn' ? 1 / factor : factor
    const newWindow = Math.min(currentWindow * factor, totalTimeseriesLength)

    // We can short-circuit some potential edge cases & needless computation around focus time if we catch the case where
    // the new window is too big.
    // TODO: This should probably be "within some epsilon of" to deal with rounding issues...
    if (newWindow >= totalTimeseriesLength) return {
        ...state,
        visibleStartTimeSeconds: state.timeseriesStartTimeSeconds,
        visibleEndTimeSeconds: state.timeseriesEndTimeSeconds
    }

    // We want to maintain the position of the anchor time point relative to the start of the old window.
    // Anchor is the currentTimeSeconds, if set, otherwise we just use the midpoint of the old window.
    const anchorTimeSec = state.currentTimeSeconds ?? state.visibleStartTimeSeconds + (currentWindow / 2)
    // Find the distance of the focus from the window start, as a fraction of the total window length.
    const anchorTimeFrac = state.currentTimeSeconds ? (state.currentTimeSeconds - state.visibleStartTimeSeconds) / currentWindow : 0.5
    // Now the new start time = anchor time - (fraction * new window size), unless that'd put us earlier than the start of the timeseries.
    let newStart = Math.max(anchorTimeSec - anchorTimeFrac * newWindow, state.timeseriesStartTimeSeconds)
    const newEnd = Math.min(newStart + newWindow, state.timeseriesEndTimeSeconds)
    // Setting the end might also have bumped up against the end of the timeseries. If we were to cap the end time at the timeseries length
    // but keep the first-computed start time, the window would be too small & we'd have zoomed in too much.
    // So we have to do one more start-time correction (which is safe--newWindow is less than the full timeseries length.)
    newStart = newEnd - newWindow
    return {
        ...state,
        visibleStartTimeSeconds: newStart,
        visibleEndTimeSeconds: newEnd
    }
}

const setVisibleTimeRange = (state: TimeseriesSelection, action: SetVisibleTimeRangeAction): TimeseriesSelection => {
    return {
        ...state,
        visibleStartTimeSeconds: action.startTimeSec,
        visibleEndTimeSeconds: action.endTimeSec
    }
}

const setCurrentTime = (state: TimeseriesSelection, action: SetCurrentTimeTimeseriesSelectionAction): TimeseriesSelection => {
    const {currentTimeSec, shiftKey, autoScrollVisibleTimeRange} = action
    let newState: TimeseriesSelection = { ...state, currentTimeSeconds: currentTimeSec, currentTimeIntervalSeconds: undefined }
    if (autoScrollVisibleTimeRange) {
        if ((state.visibleStartTimeSeconds !== undefined) && (state.visibleEndTimeSeconds !== undefined)) {
            if ((currentTimeSec < state.visibleStartTimeSeconds) || (currentTimeSec > state.visibleEndTimeSeconds)) {
                const span = state.visibleEndTimeSeconds - state.visibleStartTimeSeconds
                newState.visibleStartTimeSeconds = currentTimeSec - span / 2
                newState.visibleEndTimeSeconds = currentTimeSec + span / 2
                if (newState.visibleEndTimeSeconds > (state.timeseriesEndTimeSeconds || 0)) {
                    const delta = (state.timeseriesEndTimeSeconds || 0) - newState.visibleEndTimeSeconds
                    newState.visibleStartTimeSeconds += delta
                    newState.visibleEndTimeSeconds += delta
                }
                if (newState.visibleStartTimeSeconds < (state.timeseriesStartTimeSeconds || 0)) {
                    const delta = (state.timeseriesStartTimeSeconds || 0) - newState.visibleStartTimeSeconds
                    newState.visibleStartTimeSeconds += delta
                    newState.visibleEndTimeSeconds += delta
                }
            }
        }
    }
    if (shiftKey) {
        const t0 = state.currentTimeSeconds
        if (t0 !== undefined) {
            const t1 = Math.min(t0, currentTimeSec)
            const t2 = Math.max(t0, currentTimeSec)
            newState = {...newState, currentTimeSeconds: state.currentTimeSeconds, currentTimeIntervalSeconds: [t1, t2]}
        }
    }
    return selectionIsValid(newState) ? newState : state
}

const setCurrentTimeInterval = (state: TimeseriesSelection, action: SetCurrentTimeIntervalTimeseriesSelectionAction): TimeseriesSelection => {
    const {currentTimeIntervalSec, autoScrollVisibleTimeRange} = action
    let newState: TimeseriesSelection = { ...state, currentTimeIntervalSeconds: currentTimeIntervalSec }
    if (autoScrollVisibleTimeRange) {
        const t0 = (action.currentTimeIntervalSec[0] + action.currentTimeIntervalSec[1]) / 2
        if ((state.visibleStartTimeSeconds !== undefined) && (state.visibleEndTimeSeconds !== undefined)) {
            if ((t0 < state.visibleStartTimeSeconds) || (t0 > state.visibleEndTimeSeconds)) {
                const span = state.visibleEndTimeSeconds - state.visibleStartTimeSeconds
                newState.visibleStartTimeSeconds = t0 - span / 2
                newState.visibleEndTimeSeconds = t0 + span / 2
                if (newState.visibleEndTimeSeconds > (state.timeseriesEndTimeSeconds || 0)) {
                    const delta = (state.timeseriesEndTimeSeconds || 0) - newState.visibleEndTimeSeconds
                    newState.visibleStartTimeSeconds += delta
                    newState.visibleEndTimeSeconds += delta
                }
                if (newState.visibleStartTimeSeconds < (state.timeseriesStartTimeSeconds || 0)) {
                    const delta = (state.timeseriesStartTimeSeconds || 0) - newState.visibleStartTimeSeconds
                    newState.visibleStartTimeSeconds += delta
                    newState.visibleEndTimeSeconds += delta
                }
            }
        }
    }
    return selectionIsValid(newState) ? newState : state
}

export default TimeseriesSelectionContext
