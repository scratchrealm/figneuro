import { FunctionComponent } from "react";
import CameraViewArea from "./CameraViewArea";
// import { colorForPointIndex } from "./PoseViewport";

type Props ={
	width: number
	height: number
	videoUri: string
	videoWidth: number
	videoHeight: number
	videoNumFrames: number
	samplingFrequency: number
	// canEditPose: boolean
}

const CameraWidget: FunctionComponent<Props> = ({width, height, videoUri, videoWidth, videoHeight, videoNumFrames, samplingFrequency}) => {
	// const topPanelHeight = 100
	// const legendWidth = 50
	const topPanelHeight = 0
	const legendWidth = 0
	
	const viewAreaWidth = width - legendWidth
	const viewAreaHeight = height - topPanelHeight - 10

	// const {selectedVocalization, removePose, setBox, vocalizations, setPose, addVocalizationLabel} = useVocalizations()
	// const [annotatingBox, setAnnotatingBox] = useState(false)
	// const handleClearPose = useCallback(() => {
	// 	selectedVocalization && removePose(selectedVocalization?.vocalizationId)
	// }, [selectedVocalization, removePose])

	// const clearPoseEnabled = canEditPose && ((selectedVocalization?.pose?.points.length || 0) > 0)
	// const annotateBoxEnabled = !annotatingBox

	// const handleSelectRect = useCallback((box: {x: number, y: number, w: number, h: number}) => {
	// 	if (annotatingBox) {
	// 		setBox(box)
	// 		setAnnotatingBox(false)
	// 	}
	// }, [setBox, annotatingBox])

	// const previousVocalization = useMemo(() => {
	// 	if (!selectedVocalization) return undefined
	// 	const index = vocalizations.map(v => (v.vocalizationId)).indexOf(selectedVocalization.vocalizationId)
	// 	if (index <= 0) return undefined
	// 	return vocalizations[index - 1]
	// }, [vocalizations, selectedVocalization])

	// const handleUsePreviousPose = useCallback(() => {
	// 	if (!previousVocalization) return
	// 	if (!selectedVocalization) return
	// 	setPose(selectedVocalization.vocalizationId, previousVocalization.pose)
	// 	addVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
	// }, [previousVocalization, selectedVocalization, setPose, addVocalizationLabel])

	return (
		<div style={{position: 'absolute', width, height}}>
			{/* {
				canEditPose && selectedVocalization ? (
					<h3>Pose for vocalization {selectedVocalization.vocalizationId}</h3>
				) : (
					<h3>No associated vocalization</h3>
				)
			} */}
			{/* <div>
				<Button disabled={!clearPoseEnabled} onClick={handleClearPose}>Clear pose</Button>
				<Button disabled={!annotateBoxEnabled} onClick={() => setAnnotatingBox(true)}>Annotate box</Button>
				{annotatingBox && <span>Select a box</span>}
				<Button disabled={!(previousVocalization && previousVocalization.pose)} onClick={handleUsePreviousPose}>Use previous pose</Button>
			</div> */}
			<div style={{position: 'absolute', top: topPanelHeight, width: viewAreaWidth, height: viewAreaHeight}}>
				<CameraViewArea
					width={viewAreaWidth}
					height={viewAreaHeight}
					videoUri={videoUri}
					videoWidth={videoWidth}
					videoHeight={videoHeight}
					samplingFrequency={samplingFrequency}
					// canEditPose={canEditPose}
					// onSelectRect={handleSelectRect}
					onSelectRect={() => {}}
				/>
			</div>
			{/* <div style={{position: 'absolute', top: topPanelHeight, left: viewAreaWidth, width: legendWidth, height: viewAreaHeight}}>
				<div><span style={{color: colorForPointIndex(0), fontSize: 25}}>&#x25cf;</span></div>
				<div>head</div>
				<div>&nbsp;</div>
				<div><span style={{color: colorForPointIndex(1), fontSize: 25}}>&#x25cf;</span></div>
				<div>tail</div>
			</div> */}
		</div>
	)
}

export default CameraWidget
