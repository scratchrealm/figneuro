from typing import List
from .View import View

class Camera(View):
    def __init__(self, *,
        video_uri: str,
        video_width: int,
        video_height: int,
        video_num_frames: int,
        sampling_frequency: float
    ) -> None:
        super().__init__('saneslab.Camera')
        self.video_uri = video_uri
        self.video_width = video_width
        self.video_height = video_height
        self.video_num_frames = video_num_frames
        self.sampling_frequency = sampling_frequency
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'videoUri': self.video_uri,
            'videoWidth': int(self.video_width),
            'videoHeight': int(self.video_height),
            'videoNumFrames': int(self.video_num_frames),
            'samplingFrequency': self.sampling_frequency
        }
        return ret
    def child_views(self) -> List[View]:
        return []