# 1/25/22
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://e6ca2d115aa3b92b6da77643f07349cb8f9b5546&label=Timeseries%20graph%20example

import numpy as np
import figneuro.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()

    view = example_timeseries_graph()

    url = view.url(label='Timeseries graph example')
    print(url)

def example_timeseries_graph(*, height=500):
    # rng = np.random.default_rng(2022)
    G = vv.TimeseriesGraph(
        legend_opts={'location': 'northwest'},
        y_range=[-15, 15],
        hide_x_gridlines=False,
        hide_y_gridlines=True
    )

    # this is for testing the time offset feature
    t0 = 0

    n1 = 5000
    t = np.arange(0, n1) / n1 * 10
    v = t * np.cos((2 * t)**2)
    G.add_line_series(name='blue line', t=t0 + t, y=v.astype(np.float32), color='blue')

    n2 = 400
    t = np.arange(0, n2) / n2 * 10
    v = t * np.cos((2 * t)**2)
    G.add_marker_series(name='red marker', t=t0 + t, y=v.astype(np.float32), color='red', radius=4)

    v = t + 1
    G.add_line_series(name='green dash', t=t0 + t, y=v.astype(np.float32), color='green', width=5, dash=[12, 8])

    t = np.arange(0, 12) / 12 * 10
    v = -t - 1
    G.add_marker_series(name='black marker', t=t0 + t, y=v.astype(np.float32), color='black', radius=8, shape='square')

    return G

if __name__ == '__main__':
    main()
