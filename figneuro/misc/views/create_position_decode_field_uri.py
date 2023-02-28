import numpy as np
from typing import List
import kachery_cloud as kcl
import simplejson
import base64

class PositionDecodeFieldFrame():
    def __init__(self, *, indices: np.ndarray, values: np.ndarray) -> None:
        if type(indices) == list: indices = np.array(indices, dtype=np.uint16)
        if type(values) == list: values = np.array(values, dtype=np.uint16)

        if indices.ndim != 1: raise Exception('indices must be 1D array')
        if indices.dtype != np.uint16: raise Exception('dtype of indices must be np.uint16')
        if values.ndim != 1: raise Exception('values must be 1D array')
        if values.dtype != np.uint16: raise Exception('dtype of values must be np.uint16')
        self.indices = indices
        self.values = values

class PositionDecodeFieldBin():
    def __init__(self, *, x: float, y: float, w: float, h: float) -> None:
        self.x = x
        self.y = y
        self.w = w
        self.h = h
    def to_dict(self):
        return {'x': self.x, 'y': self.y, 'w': self.w, 'h': self.h}

def create_position_decode_field_uri(*, frames: List[PositionDecodeFieldFrame], bins: List[PositionDecodeFieldBin], max_value: float):
    text = create_position_decode_field_jsonl_text(frames=frames, bins=bins, max_value=max_value)
    return kcl.store_text(text, label='position_decode_field.jsonl')

def create_position_decode_field_jsonl_text(*, frames: List[PositionDecodeFieldFrame], bins: List[PositionDecodeFieldBin], max_value: float):
    frame_dicts = [{'i': uint16_array_to_b64(f.indices), 'v': uint16_array_to_b64(f.values)} for f in frames]
    frame_jsons = [
        simplejson.dumps(
            d,
            separators=(',', ':'), indent=None, allow_nan=False, sort_keys=True
        )
        for d in frame_dicts
    ]
    record_byte_lengths = [len(x) for x in frame_jsons]
    header_record_json = simplejson.dumps(
        {'recordByteLengths': record_byte_lengths, 'bins': [bin.to_dict() for bin in bins], 'maxValue': max_value},
        separators=(',', ':'), indent=None, allow_nan=False, sort_keys=True
    )
    text = '\n'.join([header_record_json] + frame_jsons)
    return text

def uint16_array_to_b64(a: np.ndarray):
    return base64.b64encode(a.tobytes())