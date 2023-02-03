from typing import List, Optional
import numpy as np
import figurl as fig
from .View import View
from numba import jit

class SparseAudioSpectrogram(View):
    def __init__(self, *,
        sampling_frequency: float,
        spectrogram_data: np.ndarray,
        hide_toolbar: bool=False
    ) -> None:
        super().__init__('saneslab.SparseAudioSpectrogram')
        self.sampling_frequency = sampling_frequency
        self.spectrogram_data = spectrogram_data
        self.hide_toolbar = hide_toolbar
    def to_dict(self) -> dict:
        Nf = self.spectrogram_data.shape[1]
        Nt = self.spectrogram_data.shape[0]
        vec = self.spectrogram_data.flatten(order='C')

        # np.uint16 may be desirable for very sparse data
        indices_dtype = np.uint8

        print('Preparing compressed audio spectrogram')
        values, indices_delta = _get_sparse_representation_of_vector(vec, max_delta=np.iinfo(indices_dtype).max)
        values = np.array(values, dtype=self.spectrogram_data.dtype)
        indices_delta = np.array(indices_delta, dtype=indices_dtype)
        print(f'Compression factor: {self.spectrogram_data.nbytes / (values.nbytes + indices_delta.nbytes)}')

        ret = {
            'type': self.type,
            'numFrequencies': Nf,
            'numTimepoints': Nt,
            'samplingFrequency': self.sampling_frequency,
            'spectrogramValues': values,
            'spectrogramIndicesDelta': indices_delta,
            'hideToolbar': self.hide_toolbar
        }
        return ret
    def child_views(self) -> List[View]:
        return []

@jit(nopython=True)
def _get_sparse_representation_of_vector(vec: np.array, max_delta: int):
    values = []
    indices_delta = []
    last_i = 0
    values.append(vec[0])
    indices_delta.append(0)
    i = 1
    while i < len(vec):
        if (vec[i] != 0) or (i - last_i == max_delta):
            values.append(vec[i])
            indices_delta.append(i - last_i)
            last_i = i
        i += 1
    return values, indices_delta