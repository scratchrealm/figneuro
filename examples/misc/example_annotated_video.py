# 2/28/23
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://82ec91ef8fcd5abce71d598ce3f47edccc915f28&label=Annotated%20video%20example

from typing import List
import figneuro.misc.views as fmv
import kachery_cloud as kcl
import numpy as np


def main():
    kcl.use_sandbox()
    view = example_annotated_video()

    url = view.url(label='Annotated video example')
    print(url)

def example_annotated_video():
    sampling_frequency_hz = 120
    num_frames = sampling_frequency_hz * 60 * 1
    w = 500
    h = 500
    annotation_frames: List[fmv.AnnotationFrame] = []
    for j in range(num_frames):
        elements: List[fmv.AnnotationElement] = []
        theta1 = j * 2 * np.pi / 200
        theta2 = j * 2 * np.pi / 120
        theta3 = j * 2 * np.pi / 80
        x1 = w / 2 + w / 3 * np.cos(theta1)
        y1 = w / 2 + w / 3 * np.sin(theta1)
        x2 = w / 2 + w / 5 * np.cos(theta2)
        y2 = w / 2 + w / 5 * np.sin(theta2)
        x3 = w / 2 + w / 7 * np.cos(theta3)
        y3 = w / 2 + w / 7 * np.sin(theta3)
        elements.append(fmv.NodeElement('0', x=x1, y=y1))
        elements.append(fmv.NodeElement('1', x=x2, y=y2))
        elements.append(fmv.NodeElement('2', x=x3, y=y3))
        elements.append(fmv.EdgeElement('0-1', id1='0', id2='1'))
        elements.append(fmv.EdgeElement('1-2', id1='1', id2='2'))
        F = fmv.AnnotationFrame(elements=elements)
        annotation_frames.append(F)
    annotations_uri = fmv.create_annotations_uri(annotation_frames)

    position_decode_field_bins = [
        fmv.PositionDecodeFieldBin(x=x, y=y, w=50, h=50)
        for x in [100, 150, 200, 250, 300, 350, 400]
        for y in [100]
    ] + [
        fmv.PositionDecodeFieldBin(x=x, y=y, w=50, h=50)
        for y in [150, 200, 250, 300, 350]
        for x in [400]
    ] + [
        fmv.PositionDecodeFieldBin(x=x, y=y, w=50, h=50)
        for x in [400, 350, 300, 250, 200, 150, 100]
        for y in [400]
    ] + [
        fmv.PositionDecodeFieldBin(x=x, y=y, w=50, h=50)
        for y in [350, 300, 250, 200, 150]
        for x in [100]
    ]
    num_bins = len(position_decode_field_bins)
    position_decode_field_frames = [
        fmv.PositionDecodeFieldFrame(
            indices=[(np.floor(ii * 0.1) + j) % num_bins for j in [0, 1, 2, 3, 4, 5]],
            values=[40 + ((ii * 10) % 200), 80, 120, 160, 200, 240]
        )
        for ii in range(num_frames)
    ]
    position_decode_field_max_value = 255
    position_decode_field_uri = fmv.create_position_decode_field_uri(frames=position_decode_field_frames, bins=position_decode_field_bins, max_value=position_decode_field_max_value)

    view = fmv.AnnotatedVideo(
        video_uri=None,
        video_width=w,
        video_height=h,
        video_num_frames=num_frames,
        sampling_frequency=sampling_frequency_hz,
        annotations_uri=annotations_uri,
        position_decode_field_uri=position_decode_field_uri
    )
    return view

if __name__ == '__main__':
    main()
