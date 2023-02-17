from typing import Union
import os
import json
import time
import cv2

def create_qjb1(*, input: str, output: str, quality: int, duration_sec: Union[float, None]=None):
    input_file_size = os.path.getsize(input)
    vid = cv2.VideoCapture(input)

    height = int(vid.get(cv2.CAP_PROP_FRAME_HEIGHT))
    width = int(vid.get(cv2.CAP_PROP_FRAME_WIDTH))
    fps = vid.get(cv2.CAP_PROP_FPS)
    num_frames = vid.get(cv2.CAP_PROP_FRAME_COUNT)

    print(f'height/width: {height}/{width}')
    print(f'fps: {fps}')
    print(f'# frames: {num_frames}')
    print(f'duration (min): {num_frames / fps / 60}')
    print(f'file size (MiB): {input_file_size / 1e6}')
    print(f'file size per frame (bytes): {input_file_size / num_frames}')
    input_size_per_second = input_file_size / num_frames * fps
    print(f'size per second (MiB): {input_size_per_second / 1e6}')
    print(f'Using jpg quality {quality}/100')
    print()

    if duration_sec is not None:
        num_frames = int(duration_sec * fps)
    print(f'Creating {num_frames} frames ({num_frames / fps} sec)')

    header = {
        'format': 'qjb1',
        'video_width': width,
        'video_height': height,
        'frames_per_second': fps,
        'num_frames': num_frames,
        'quality': quality
    }

    with open(output, 'wb') as f:
        print('Writing header')
        f.write(bytes('qjb1.ecv9vh5lt\n', 'utf-8'))
        f.write(bytes(json.dumps(header), 'utf-8'))
        f.write(bytes('\n', 'utf-8'))

        print('Writing index placeholder')
        # write all zeros for now, then we'll come back and rewrite
        byte_num = f.tell()
        for j in range(num_frames):
            z = 0
            f.write(z.to_bytes(length=4, byteorder='little', signed=False))
        
        print('Writing image frames')
        sizes = []
        timer = time.time()
        for j in range(num_frames):
            elapsed = time.time() - timer
            if elapsed > 3:
                print(f'Writing frame {j} ({int(j / num_frames * 100)}%)')
                timer = time.time()
            _, frame = vid.read()
            _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
            sizes.append(len(buffer))
            f.write(buffer)
        
        print(f'Rewriting index at byte {byte_num}')
        f.seek(byte_num)
        for j in range(num_frames):
            xx = sizes[j]
            f.write(xx.to_bytes(length=4, byteorder='little', signed=False))
    
    output_file_size = os.path.getsize(output)

    print()
    print(f'output file size (MiB): {output_file_size / 1e6}')
    print(f'output file size per frame (bytes): {output_file_size / num_frames}')
    output_size_per_second = output_file_size / num_frames * fps
    print(f'output size per second (MiB): {output_size_per_second / 1e6}')
    print(f'size factor compared with input: {output_size_per_second / input_size_per_second}')