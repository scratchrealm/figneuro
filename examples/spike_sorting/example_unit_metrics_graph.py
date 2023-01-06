# 1/6/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://6c4f240cfdb83ed4b23b135bf9dcc7d95298acd3&label=Unit%20metrics%20graph%20example

from typing import List
import figneuro.spike_sorting.views as ssv
import figneuro.views as vv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl
from helpers.create_units_table import create_units_table


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_unit_metrics_graph(recording=recording, sorting=sorting)

    view2 = vv.Box(
        direction='horizontal',
        items=[
            vv.LayoutItem(create_units_table(sorting=sorting), max_size=150),
            vv.LayoutItem(view)
        ]
    )

    url = view2.url(label='Unit metrics graph example')
    print(url)

def example_unit_metrics_graph(*, recording: si.BaseRecording, sorting: si.BaseSorting, height=800):
    metrics: List[ssv.UnitMetricsGraphMetric] = [
        ssv.UnitMetricsGraphMetric(
            key='numEvents',
            label='Num. events',
            dtype='int'
        ),
        ssv.UnitMetricsGraphMetric(
            key='firingRateHz',
            label='Firing rate (Hz)',
            dtype='float'
        )
    ]
    units: List[ssv.UnitMetricsGraphUnit] = []
    for unit_id in sorting.get_unit_ids():
        spike_train = sorting.get_unit_spike_train(segment_index=0, unit_id=unit_id)
        units.append(
            ssv.UnitMetricsGraphUnit(
                unit_id=unit_id,
                values={
                    'numEvents': len(spike_train),
                    'firingRateHz': len(spike_train) / (recording.get_num_frames(segment_index=0) / recording.get_sampling_frequency())
                }
            )
        )
    view = ssv.UnitMetricsGraph(
        units=units,
        metrics=metrics,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
