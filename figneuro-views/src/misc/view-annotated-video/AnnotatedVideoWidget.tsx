import { FunctionComponent } from "react";
import AnnotatedVideoViewArea from "./AnnotatedVideoViewArea";
// import { colorForPointIndex } from "./PoseViewport";

type Props ={
	width: number
	height: number
	videoUri?: string
	videoWidth: number
	videoHeight: number
	videoNumFrames: number
	samplingFrequency: number
	annotationsUri?: string
	// canEditPose: boolean
}

const AnnotatedVideoWidget: FunctionComponent<Props> = ({width, height, videoUri, videoWidth, videoHeight, videoNumFrames, samplingFrequency, annotationsUri}) => {
	// const topPanelHeight = 100
	// const legendWidth = 50
	const topPanelHeight = 0
	const legendWidth = 0
	
	const viewAreaWidth = width - legendWidth
	const viewAreaHeight = height - topPanelHeight - 10

	return (
		<div style={{position: 'absolute', width, height}}>
			<div style={{position: 'absolute', top: topPanelHeight, width: viewAreaWidth, height: viewAreaHeight}}>
				<AnnotatedVideoViewArea
					width={viewAreaWidth}
					height={viewAreaHeight}
					videoUri={videoUri}
					annotationsUri={annotationsUri}
					videoWidth={videoWidth}
					videoHeight={videoHeight}
					samplingFrequency={samplingFrequency}
					onSelectRect={() => {}}
				/>
			</div>
		</div>
	)
}

export default AnnotatedVideoWidget
