from typing import List, Union
from .View import View

class AnnotatedVideoNode():
    def __init__(self, *, id: str, label: str, color_index: int) -> None:
        self.id = id
        self.label = label
        self.color_index = color_index
    def to_dict(self):
        return {
            'id': self.id,
            'label': self.label,
            'colorIndex': self.color_index
        }

class AnnotatedVideo(View):
    def __init__(self, *,
        video_width: int,
        video_height: int,
        video_num_frames: int,
        sampling_frequency: float,
        video_uri: Union[str, None]=None,
        annotations_uri: Union[str, None]=None,
        nodes: Union[List[AnnotatedVideoNode], None]=None,
        position_decode_field_uri: Union[str, None]=None
    ) -> None:
        super().__init__('misc.AnnotatedVideo')
        self.video_uri = video_uri
        self.video_width = video_width
        self.video_height = video_height
        self.video_num_frames = video_num_frames
        self.sampling_frequency = sampling_frequency
        self.annotations_uri = annotations_uri
        self.nodes = nodes
        self.position_decode_field_uri = position_decode_field_uri
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'videoWidth': int(self.video_width),
            'videoHeight': int(self.video_height),
            'videoNumFrames': int(self.video_num_frames),
            'samplingFrequency': self.sampling_frequency
        }
        if self.video_uri:
            ret['videoUri'] = self.video_uri
        if self.annotations_uri:
            ret['annotationsUri'] = self.annotations_uri
        if self.nodes:
            ret['nodes'] = [n.to_dict() for n in self.nodes]
        if self.position_decode_field_uri:
            ret['positionDecodeFieldUri'] = self.position_decode_field_uri
        return ret
    def child_views(self) -> List[View]:
        return []