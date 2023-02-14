# 2/14/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://d204de259d76cf9e04f8c3de1f1e6819e3874f79&label=SLEAP%20example

# https://sleap.ai/notebooks/Analysis_examples.html
# https://github.com/talmolab/sleap/tree/main/docs/notebooks/analysis_example
# sha1://19b93731a96138493c4bf66787890c173c3c9998?label=20190128_113421.120s.mp4
# sha1://a7e667f23383ca4bcbab66f67b59a510bcadd78a?label=predictions.analysis.h5

# ffmpeg -i `kachery-cloud-load sha1://19b93731a96138493c4bf66787890c173c3c9998?label=20190128_113421.120s.mp4` -c:v libtheora -q:v 7 -c:a libvorbis -q:a 4 20190128_113421.120s.ogv
# sha1://27ece25c818d606bbe097d220ec50cf36eb3ea8a?label=20190128_113421.120s.ogv

from typing import List
import kachery_cloud as kcl
import cv2
import figneuro.misc.views as mv
import h5py
import numpy as np

ogv_uri = 'sha1://27ece25c818d606bbe097d220ec50cf36eb3ea8a?label=20190128_113421.120s.ogv'
h5_uri = 'sha1://a7e667f23383ca4bcbab66f67b59a510bcadd78a?label=predictions.analysis.h5'

def create_view():
    ogv_fname = kcl.load_file(ogv_uri)

    vid = cv2.VideoCapture(ogv_fname)
    height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
    width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
    fps = vid.get(cv2.CAP_PROP_FPS)
    num_frames = int(vid.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f'height/width: {height}/{width}')
    print(f'fps: {fps}')
    print(f'num_frames: {num_frames}')

    h5_fname = kcl.load_file(h5_uri)

    with h5py.File(h5_fname, "r") as f:
        dset_names = list(f.keys())
        locations = f["tracks"][:].T
        node_names = [n.decode() for n in f["node_names"][:]]

    print("===HDF5 datasets===")
    print(dset_names)
    print()

    print("===locations data shape===")
    print(locations.shape)
    print()

    print("===nodes===")
    for i, name in enumerate(node_names):
        print(f"{i}: {name}")
    print()

    frame_count, node_count, _, instance_count = locations.shape
    annotation_frames: List[mv.AnnotationFrame] = []
    for i in range(frame_count):
        elements: List[mv.AnnotationElement] = []
        for ianimal in range(locations.shape[3]):
            for inode, name in enumerate(node_names):
                x = locations[i, inode, 0, ianimal]
                y = locations[i, inode, 1, ianimal]
                id = f'{ianimal}-{inode}'
                if not np.isnan(x):
                    elements.append(
                        mv.NodeElement(
                            id=id,
                            x=x,
                            y=y
                        )
                    )
        annotation_frames.append(mv.AnnotationFrame(elements))
    annotations_uri = mv.create_annotations_uri(annotation_frames)

    nodes: List[mv.AnnotatedVideoNode] = []
    for ianimal in range(locations.shape[3]):
        for inode, name in enumerate(node_names):
            id = f'{ianimal}-{inode}'
            nodes.append(
                mv.AnnotatedVideoNode(
                    id=id,
                    label=f'{name} {ianimal}',
                    color_index=int(inode)
                )
            )

    V = mv.AnnotatedVideo(
        video_uri=ogv_uri,
        video_width=width,
        video_height=height,
        video_num_frames=num_frames,
        sampling_frequency=fps,
        annotations_uri=annotations_uri,
        nodes=nodes
    )
    return V

if __name__ == '__main__':
    V = create_view()
    url = V.url(label='SLEAP example')
    print(url)