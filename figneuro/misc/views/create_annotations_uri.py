from typing import List
import figurl as fig
import kachery_cloud as kcl
import simplejson


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

def create_annotations_uri(annotation_frames: List[AnnotationFrame]):
    text = create_annotations_jsonl_text(annotation_frames)
    return kcl.store_text(text, label='annotations.jsonl')

def create_annotations_jsonl_text(annotation_frames: List[AnnotationFrame]):
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
    return text