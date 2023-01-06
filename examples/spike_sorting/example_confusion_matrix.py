# 1/6/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://8fe7e63e485a6fb326d7b7e925fb1e8d7a83c1b4&label=Confusion%20matrix

from typing import List
import spikeinterface as si
import spikeinterface.sorters as ss
import spikeinterface.comparison as sc
import spikeinterface.extractors as se
import kachery_cloud as kcl
import figneuro.views as vv
import figneuro.spike_sorting.views as ssv


def main():
    kcl.use_sandbox()
    recording, _ = se.toy_example(num_units=12, num_channels=4, duration=200, seed=0, num_segments=1)
    with kcl.TemporaryDirectory() as tmpdir:
        sorter_params1 = {
            'detect_sign': -1,
            'adjacency_radius': -1,
            'freq_min': 300,
            'freq_max': 6000,
            'filter': True,
            'whiten': True,
            'num_workers': 4,
            'clip_size': 50,
            'detect_threshold': 3,
            'detect_interval': 10
        }
        sorter_params2 = {**sorter_params1}
        sorter_params2['whiten'] = False
        R: si.BaseRecording = recording.save_to_folder(folder=tmpdir + '/recording')
        sortings = [ss.run_mountainsort4(
            recording=R,
            output_folder=f'{tmpdir}/output{i + 1}',
            remove_existing_folder=False,
            delete_output_folder=False,
            verbose=True,
            raise_error=True,
            docker_image=False,
            singularity_image=False,
            with_output=True,
            **sorter_params
        ) for i, sorter_params in enumerate([sorter_params1, sorter_params2])]
        sorting1: si.BaseSorting = sortings[0]
        sorting2: si.BaseSorting = sortings[1]
        view = example_confusion_matrix(sorting1=sorting1, sorting2=sorting2)

        view_units_table = _create_units_table(sorting1=sorting1, sorting2=sorting2)

        view_composite = vv.Box(
            direction='horizontal',
            items=[
                vv.LayoutItem(
                    view_units_table,
                    max_size=200
                ),
                vv.LayoutItem(
                    view
                )
            ]
        )

        url = view_composite.url(label='Confusion matrix')
        print(url)

def _create_units_table(*, sorting1: si.BaseSorting, sorting2: si.BaseSorting):
    columns: List[ssv.UnitsTableColumn] = []
    rows: List[ssv.UnitsTableRow] = []
    for unit_id in sorting1.get_unit_ids():
        rows.append(
            ssv.UnitsTableRow(
                unit_id=f'A{unit_id}',
                values={}
            )
        )
    for unit_id in sorting2.get_unit_ids():
        rows.append(
            ssv.UnitsTableRow(
                unit_id=f'B{unit_id}',
                values={}
            )
        )
    return ssv.UnitsTable(
        columns=columns,
        rows=rows
    )

def example_confusion_matrix(*, sorting1: si.BaseSorting, sorting2: si.BaseSorting, height=400):
    SC: sc.SymmetricSortingComparison = sc.compare_two_sorters(sorting1=sorting1, sorting2=sorting2)

    unit_event_counts: List[ssv.UnitEventCount] = []
    for unit_id in sorting1.unit_ids:
        unit_event_counts.append(ssv.UnitEventCount(unit_id=f'A{unit_id}', count=len(sorting1.get_unit_spike_train(unit_id))))
    for unit_id in sorting2.unit_ids:
        unit_event_counts.append(ssv.UnitEventCount(unit_id=f'B{unit_id}', count=len(sorting2.get_unit_spike_train(unit_id))))

    matching_unit_event_counts: List[ssv.MatchingUnitEventCount] = []
    for id1 in sorting1.unit_ids:
        ids2 = SC.get_matching_unit_list1(id1)
        for id2 in ids2:
            count = SC.get_matching_event_count(id1, id2)
            matching_unit_event_counts.append(ssv.MatchingUnitEventCount(unit_id1=f'A{id1}', unit_id2=f'B{id2}', count=count))

    view = ssv.ConfusionMatrix(
        sorting1_unit_ids=[f'A{id}' for id in sorting1.unit_ids],
        sorting2_unit_ids=[f'B{id}' for id in sorting2.unit_ids],
        unit_event_counts=unit_event_counts,
        matching_unit_event_counts=matching_unit_event_counts,
        height=height
    )
    return view

if __name__ == '__main__':
    main()
