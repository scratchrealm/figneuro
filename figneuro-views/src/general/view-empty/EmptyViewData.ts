import { isEqualTo, validateObject } from "@figurl/core-utils"

export type EmptyViewData = {
    type: 'Empty',
}

export const isEmptyViewData = (x: any): x is EmptyViewData => {
    return validateObject(x, {
        type: isEqualTo('Empty')
    })
}