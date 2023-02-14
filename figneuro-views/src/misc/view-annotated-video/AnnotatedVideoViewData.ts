import { isEqualTo, isNumber, validateObject, optional, isString, isArrayOf } from "@figurl/core-utils"

export type AnnotatedVideoNode = {
    id: string
    label: string
    colorIndex?: number
}

export type AnnotatedVideoViewData = {
    type: 'misc.AnnotatedVideo',
    videoUri?: string
    videoWidth: number
    videoHeight: number
    videoNumFrames: number
    samplingFrequency: number
    annotationsUri?: string
    nodes?: AnnotatedVideoNode[]
}

export const isAnnotatedVideoViewData = (x: any): x is AnnotatedVideoViewData => {
    return validateObject(x, {
        type: isEqualTo('misc.AnnotatedVideo'),
        videoUri: optional(isString),
        videoWidth: isNumber,
        videoHeight: isNumber,
        videoNumFrames: isNumber,
        samplingFrequency: isNumber,
        annotationsUri: optional(isString),
        nodes: optional(isArrayOf(y => (validateObject(y, {
            id: isString,
            label: isString,
            colorIndex: optional(isNumber)
        }))))
    })
}