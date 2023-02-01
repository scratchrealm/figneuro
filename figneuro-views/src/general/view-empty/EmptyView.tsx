import { FunctionComponent } from "react"
import { EmptyViewData } from "./EmptyViewData"

type Props = {
	data: EmptyViewData
	width: number
	height: number
}

const EmptyView: FunctionComponent<Props> = ({width, height}) => {
	return (
        <div style={{position: 'absolute', width, height}} />
    )
}

export default EmptyView
