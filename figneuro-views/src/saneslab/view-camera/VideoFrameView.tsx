import { getFileDataUrl } from "@figurl/interface";
import { AffineTransform } from "@figurl/spike-sorting-views";
import { PlayArrow, Stop } from "@mui/icons-material";
import { FormControl, IconButton, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props ={
	src: string
	timeSec: number | undefined
	setTimeSec: (t: number) => void
	width: number
	height: number
	affineTransform: AffineTransform
}

const VideoFrameView: FunctionComponent<Props> = ({src, timeSec, setTimeSec, width, height, affineTransform}) => {
	const [srcUrl, setSrcUrl] = useState<string>()
	const [seeking, setSeeking] = useState<boolean>(false)
	const [playing, setPlaying] = useState<boolean>(false)
	const [playbackRate, setPlaybackRate] = useState<number>(1)
	const [refreshCode, setRefreshCode] = useState(0)
	useEffect(() => {
		if (src.startsWith('sha1://')) {
			getFileDataUrl(src).then((url) => {
				setSrcUrl(url)
			}).catch(err => {
				console.warn(`Problem getting file data url for ${src}`)
			})
		}
		else {
			setSrcUrl(src)
		}
	}, [src])
	const canvasRef = useRef<any>(null)
	const handleDrawVideoFrame = useCallback((v: HTMLVideoElement) => {
		const ctx: CanvasRenderingContext2D | undefined = canvasRef.current?.getContext('2d')
		if (!ctx) return

		// clearRect causes a flicker
		// ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

		ctx.save()
		const ff = affineTransform.forward
		ctx.transform(ff[0][0], ff[1][0], ff[0][1], ff[1][1], ff[0][2], ff[1][2])

		const W = v.videoWidth
		const H = v.videoHeight
		const W2 = W * height < H * width ? W * height / H : width
		const H2 = W * height < H * width ? height : H * width / W
		ctx.drawImage(v, (width - W2) / 2, (height - H2) / 2, W2, H2)
		
		ctx.restore()

		if (seeking) {
			ctx.strokeStyle = 'magenta'
			ctx.strokeText('Loading...', 20, 20)
		}
	}, [width, height, affineTransform, seeking])
	const video = useMemo(() => {
		if (!srcUrl) return undefined
		const v = document.createElement('video')
		v.addEventListener('seeked', (a) => {
			setSeeking(false)
			setRefreshCode(c => (c + 1))
		})
		v.src = srcUrl
		return v
	}, [srcUrl])
	useEffect(() => {
		video && handleDrawVideoFrame(video)
	}, [video, seeking, refreshCode, handleDrawVideoFrame])
	useEffect(() => {
		if (!video) return
		video.playbackRate = playbackRate
	}, [playbackRate, video])
	useEffect(() => {
		if (!video) return
		if (playing) return // avoid a loop during playing!
		if (timeSec !== undefined) {
			setSeeking(true)
			video.currentTime = timeSec || 0.0001 // for some reason it doesn't like currentTime=0 for initial display
		}
	}, [video, timeSec, playing])
	const bottomBarHeight = 30
	useEffect(() => {
		if (!video) return
		if (!playing) {
			video.pause()
			return
		}
		video.play()
		let canceled = false
		function drawIt() {
			if (canceled) return
			if (!video) return
			video && handleDrawVideoFrame(video)
			setTimeout(() => {
				drawIt()
				if (video) {
					setTimeSec(video.currentTime)
				}
			}, 30)
		}
		drawIt()
		return () => {canceled = true}
	}, [playing, handleDrawVideoFrame, video, setTimeSec])
	const handlePlay = useCallback(() => {
		setPlaying(true)
	}, [])
	const handleStop = useCallback(() => {
		setPlaying(false)
	}, [])
	return (
		<div style={{position: 'absolute', width, height}}>
			<canvas
				ref={canvasRef}
				width={width}
				height={height - bottomBarHeight}
			/>
			<div style={{position: 'absolute', width, height: bottomBarHeight, top: height - bottomBarHeight}}>
				<IconButton title="Play video" disabled={playing} onClick={handlePlay}><PlayArrow /></IconButton>
				<IconButton title="Stop video" disabled={!playing} onClick={handleStop}><Stop /></IconButton>
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

export default VideoFrameView
