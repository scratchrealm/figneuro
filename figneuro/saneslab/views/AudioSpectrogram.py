from typing import List, Optional
import numpy as np
import figurl as fig
from .View import View

class AudioSpectrogram(View):
    def __init__(self, *,
        sampling_frequency: float,
        spectrogram_data: np.ndarray
    ) -> None:
        super().__init__('saneslab.AudioSpectrogram')
        self.sampling_frequency = sampling_frequency
        self.spectrogram_data = spectrogram_data
    def to_dict(self) -> dict:
        ret = {
            'type': self.type,
            'samplingFrequency': self.sampling_frequency,
            'spectrogramData': fig.serialize_data(self.spectrogram_data, compress_npy=True)
        }
        return ret
    def child_views(self) -> List[View]:
        return []