# 1/6/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://e0b6c94ca7e6d0ef761e94f3551c00eb8ed23636&label=Spike%20amplitudes%20example

import numpy as np
from typing import List
import figneuro.spike_sorting.views as ssv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_spike_amplitudes(recording=recording, sorting=sorting)

    url = view.url(label='Spike amplitudes example')
    print(url)

def example_spike_amplitudes(*, recording: si.BaseRecording, sorting: si.BaseSorting, hide_unit_selector: bool=False, height=500):
    rng = np.random.default_rng(2022)
    plot_items: List[ssv.SpikeAmplitudesItem] = []
    for unit_id in sorting.get_unit_ids():
        spike_times_sec = np.array(sorting.get_unit_spike_train(segment_index=0, unit_id=unit_id)) / sorting.get_sampling_frequency()
        plot_items.append(
            ssv.SpikeAmplitudesItem(
                unit_id=unit_id,
                spike_times_sec=spike_times_sec.astype(np.float32),
                spike_amplitudes=rng.uniform(0, 5) + rng.normal(0, 0.2, spike_times_sec.shape).astype(np.float32) # fake amplitudes
            )
        )

    view = ssv.SpikeAmplitudes(
        start_time_sec=0,
        end_time_sec=recording.get_num_frames(segment_index=0) / recording.get_sampling_frequency(),
        plots=plot_items,
        hide_unit_selector=hide_unit_selector,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
