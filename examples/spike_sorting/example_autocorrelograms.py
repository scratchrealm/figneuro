# 1/6/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://3f5dbe1b337a1b783c53dd3ddb6cf9d6dff72dd6&label=Autocorrelograms%20example

from typing import List
import figneuro.spike_sorting.views as ssv
import spikeinterface as si
import spikeinterface.extractors as se
import kachery_cloud as kcl
from helpers.compute_correlogram_data import compute_correlogram_data


def main():
    kcl.use_sandbox()
    _, sorting = se.toy_example(num_units=12, duration=300, seed=0, num_segments=1)

    view = example_autocorrelograms(sorting=sorting)
    url = view.url(label='Autocorrelograms example')
    print(url)

def example_autocorrelograms(*, sorting: si.BaseSorting, height=400):
    autocorrelogram_items: List[ssv.AutocorrelogramItem] = []
    for unit_id in sorting.get_unit_ids():
        a = compute_correlogram_data(sorting=sorting, unit_id1=unit_id, unit_id2=None, window_size_msec=50, bin_size_msec=1)
        bin_edges_sec = a['bin_edges_sec']
        bin_counts = a['bin_counts']
        autocorrelogram_items.append(
            ssv.AutocorrelogramItem(
                unit_id=unit_id,
                bin_edges_sec=bin_edges_sec,
                bin_counts=bin_counts
            )
        )
    view = ssv.Autocorrelograms(
        autocorrelograms=autocorrelogram_items,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
