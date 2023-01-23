# 1/20/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://07453ddf73bcbe36776fd4d069c8ec7afed06586&label=example%201

import figneuro.views as vv
import figneuro.spike_sorting.views as ssv
import spikeinterface.extractors as se
import kachery_cloud as kcl
from example_autocorrelograms import example_autocorrelograms
from example_raster_plot import example_raster_plot
from example_spike_amplitudes import example_spike_amplitudes
from example_units_table import example_units_table
from typing import List


def main():
    kcl.use_sandbox()
    recording, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view0 = create_units_table(recording=recording, sorting=sorting)
    view1 = example_autocorrelograms(sorting=sorting)
    view2 = example_raster_plot(recording=recording, sorting=sorting)
    view3 = example_spike_amplitudes(recording=recording, sorting=sorting, hide_unit_selector=True)

    right_content = vv.Box(
        direction='vertical',
        items=[
            vv.LayoutItem(view2),
            vv.LayoutItem(view3)
        ]
    )
    view = vv.Box(
        direction='horizontal',
        items=[
            vv.LayoutItem(
                view0,
                max_size=150
            ),
            vv.LayoutItem(
                view1,
                stretch=1
            ),
            vv.LayoutItem(
                right_content,
                stretch=2
            )
        ]
    )
    
    url = view.url(label='example 1')
    print(url)

def create_units_table(*, recording, sorting, height=600):
    columns: List[ssv.UnitsTableColumn] = [
        ssv.UnitsTableColumn(
            key='unitId',
            label='Unit',
            dtype='int'
        )
    ]
    rows: List[ssv.UnitsTableRow] = []
    for unit_id in sorting.get_unit_ids():
        spike_train = sorting.get_unit_spike_train(unit_id=unit_id)
        rows.append(
            ssv.UnitsTableRow(
                unit_id=unit_id,
                values={
                    'unitId': unit_id
                }
            )
        )
    view = ssv.UnitsTable(
        columns=columns,
        rows=rows,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
