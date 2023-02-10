import { useTimeRange, useTimeseriesSelection } from "@figurl/timeseries-views";
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import AnnotationsFrameView from "./AnnotationsFrameView";
// import PoseViewport from "./PoseViewport";
import { PlayArrow, Stop } from "@mui/icons-material";
import { FormControl, IconButton, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import useWheelZoom from "./useWheelZoom";
import VideoFrameView from "./VideoFrameView";


type Props ={
	width: number
	height: number
	videoUri?: string
	annotationsUri?: string
	videoWidth: number
	videoHeight: number
	samplingFrequency: number
	// canEditPose: boolean
	onSelectRect?: (r: {x: number, y: number, w: number, h: number}) => void
}

const AnnotatedVideoViewArea: FunctionComponent<Props> = ({width, height, videoUri, annotationsUri, videoWidth, videoHeight, samplingFrequency}) => {
	const bottomBarHeight = 30
	const {currentTime, setCurrentTime} = useTimeseriesSelection()
	const {visibleStartTimeSec, visibleEndTimeSec, setVisibleTimeRange} = useTimeRange()
	const height2 = height - bottomBarHeight
	const W = videoWidth * height2 < videoHeight * width ? videoWidth * height2 / videoHeight : width
	const H = videoWidth * height2 < videoHeight * width ? height2 : videoHeight * width / videoWidth
	const scale =useMemo(() => ([W / videoWidth, H / videoHeight] as [number, number]), [W, H, videoWidth, videoHeight])
	const rect = useMemo(() => ({
		x: (width - W)  / 2,
		y: (height2 - H) / 2,
		w: W,
		h: H
	}), [W, H, width, height2])
	const {affineTransform, handleWheel} = useWheelZoom(rect.x, rect.y, rect.w, rect.h)
	const handleSetTimeSec = useCallback((t: number) => {
		setCurrentTime(t)
		if ((visibleStartTimeSec !== undefined) && (visibleEndTimeSec !== undefined)) {
			if ((t < visibleStartTimeSec) || (t > visibleEndTimeSec)) {
				let delta = t - (visibleStartTimeSec + visibleEndTimeSec) / 2
				if (visibleStartTimeSec + delta < 0) delta = -visibleStartTimeSec
				setVisibleTimeRange(visibleStartTimeSec + delta, visibleEndTimeSec + delta)
			}
		}
	}, [visibleStartTimeSec, visibleEndTimeSec, setVisibleTimeRange, setCurrentTime])
	const [playing, setPlaying] = useState<boolean>(false)
	const [playbackRate, setPlaybackRate] = useState<number>(1)
	const handlePlay = useCallback(() => {
		setPlaying(true)
	}, [])
	const handleStop = useCallback(() => {
		setPlaying(false)
	}, [])
	const currentTimeRef = useRef<number>(currentTime || 0)
	useEffect(() => {
		currentTimeRef.current = currentTime || 0
	}, [currentTime])
	useEffect(() => {
		if (!playing) return
		if (videoUri) {
			// the playing is taken care of by the video frame view
			return
		}
		const startTime = currentTimeRef.current
		const timer = Date.now()
		let rr = 0
		const update = () => {
			const elapsed = (Date.now() - timer) / 1000
			setCurrentTime(startTime + elapsed * playbackRate)
			rr = requestAnimationFrame(update)
		}
		rr = requestAnimationFrame(update)
		return () => cancelAnimationFrame(rr)
	}, [playing, videoUri, setCurrentTime, playbackRate])
	return (
		<div style={{position: 'absolute', width, height}} onWheel={handleWheel}>
			<div className="video-frame" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
				{
					videoUri && <VideoFrameView
						width={rect.w}
						height={rect.h}
						timeSec={currentTime}
						setTimeSec={handleSetTimeSec}
						src={videoUri}
						affineTransform={affineTransform}
						playing={playing}
						playbackRate={playbackRate}
					/>
				}
			</div>
			<div className="annotations-frame" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
				{
					annotationsUri && <AnnotationsFrameView
						width={rect.w}
						height={rect.h}
						timeSec={currentTime}
						annotationsUri={annotationsUri}
						affineTransform={affineTransform}
						samplingFrequency={samplingFrequency}
						scale={scale}
					/>
				}
			</div>
			{/* <div className="pose-viewport" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
				<PoseViewport
					width={rect.w}
					height={rect.h}
					videoWidth={video.width}
					videoHeight={video.height}
					canEditPose={canEditPose}
					videoSamplingFrequency={video.samplingFrequency}
					affineTransform={affineTransform}
					onSelectRect={onSelectRect}
				/>
			</div> */}
			<div style={{position: 'absolute', width, height: bottomBarHeight, top: height2}}>
				{!playing && <IconButton title="Play video" disabled={playing} onClick={handlePlay}><PlayArrow /></IconButton>}
				{playing && <IconButton title="Stop video" disabled={!playing} onClick={handleStop}><Stop /></IconButton>}
				<PlaybackRateControl playbackRate={playbackRate} setPlaybackRate={setPlaybackRate} />
			</div>
		</div>
	)
}

const PlaybackRateControl: FunctionComponent<{playbackRate: number, setPlaybackRate: (x: number) => void}> = ({playbackRate, setPlaybackRate}) => {
	const handleChange = useCallback((e: SelectChangeEvent) => {
		setPlaybackRate(parseFloat(e.target.value))
	}, [setPlaybackRate])
	return (
		<FormControl size="small">
			<Select onChange={handleChange} value={playbackRate + ''}>
				<MenuItem key={0.1} value={0.1}>0.1x</MenuItem>
				<MenuItem key={0.25} value={0.25}>0.25x</MenuItem>
				<MenuItem key={0.5} value={0.5}>0.5x</MenuItem>
				<MenuItem key={1} value={1}>1x</MenuItem>
				<MenuItem key={2} value={2}>2x</MenuItem>
				<MenuItem key={4} value={4}>4x</MenuItem>
				<MenuItem key={8} value={8}>8x</MenuItem>
			</Select>
		</FormControl>
	)
}

export default AnnotatedVideoViewArea
