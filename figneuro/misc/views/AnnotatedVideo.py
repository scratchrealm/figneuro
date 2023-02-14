from typing import List, Union
import simplejson
from .View import View
import kachery_cloud as kcl
import figurl as fig

class AnnotationElement():
    def __init__(
        self,
        *,
        type: str,
        id: str,
        data: dict
    ) -> None:
        self.type = type
        self.id = id
        self.data = data
    def to_dict(self):
        return {
            't': self.type, # type
            'i': self.id, # id
            **fig.serialize_data(self.data) # data
        }

class NodeElement(AnnotationElement):
    def __init__(self, id: str, *, x: float, y: float) -> None:
        super().__init__(type='n', id=id, data={'x': x, 'y': y})

class EdgeElement(AnnotationElement):
    def __init__(self, id: str, *, id1: str, id2: str) -> None:
        super().__init__(type='e', id=id, data={'i1': id1, 'i2': id2})

class AnnotationFrame():
    def __init__(self, elements: List[AnnotationElement]) -> None:
        self.elements = elements

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

def create_annotations_uri(annotation_frames: List[AnnotationFrame]):
    frame_dicts = [{'e': [e.to_dict() for e in f.elements]} for f in annotation_frames]
    frame_jsons = [
        simplejson.dumps(
            d,
            separators=(',', ':'), indent=None, allow_nan=False, sort_keys=True
        )
        for d in frame_dicts
    ]
    record_byte_lengths = [len(x) for x in frame_jsons]
    header_record_json = simplejson.dumps(
        {'recordByteLengths': record_byte_lengths},
        separators=(',', ':'), indent=None, allow_nan=False, sort_keys=True
    )
    text = '\n'.join([header_record_json] + frame_jsons)
    return kcl.store_text(text, label='annotations.jsonl')

class AnnotatedVideo(View):
    def __init__(self, *,
        video_width: int,
        video_height: int,
        video_num_frames: int,
        sampling_frequency: float,
        video_uri: Union[str, None]=None,
        annotations_uri: Union[str, None]=None,
        nodes: Union[List[AnnotatedVideoNode], None]=None
    ) -> None:
        super().__init__('misc.AnnotatedVideo')
        self.video_uri = video_uri
        self.video_width = video_width
        self.video_height = video_height
        self.video_num_frames = video_num_frames
        self.sampling_frequency = sampling_frequency
        self.annotations_uri = annotations_uri
        self.nodes = nodes
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
        return ret
    def child_views(self) -> List[View]:
        return []