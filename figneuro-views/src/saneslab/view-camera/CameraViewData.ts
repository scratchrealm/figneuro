import { isEqualTo, isNumber, validateObject } from "@figurl/core-utils"
import { isString } from "@figurl/core-views/dist/figurl-canvas/Geometry"

export type CameraViewData = {
    type: 'saneslab.Camera',
    videoUri: string
    videoWidth: number
    videoHeight: number
    videoNumFrames: number
    samplingFrequency: number
}

export const isCameraViewData = (x: any): x is CameraViewData => {
    return validateObject(x, {
        type: isEqualTo('saneslab.Camera'),
        videoUri: isString,
        videoWidth: isNumber,
        videoHeight: isNumber,
        videoNumFrames: isNumber,
        samplingFrequency: isNumber
    })
}