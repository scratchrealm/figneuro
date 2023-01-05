# 1/5/22
# https://figurl.org/f?v=gs://figurl/figneuro-1&d=sha1://06c5accdcb7f9b7af1fba0df7c7d7ec00cff842f&label=Markdown%20example

import figneuro.views as vv
import kachery_cloud as kcl


def main():
    kcl.use_sandbox()
    view = example_markdown()

    url = view.url(label='Markdown example')
    print(url)

def example_markdown():
    view = vv.Markdown(
'''
# Test markdown

Example markdown source

* list item 1
* list item 2
* list item 3

Code snippet:

```python
import spikeinterface as si

print(si.__version__)
```
'''
    )
    return view

if __name__ == '__main__':
    main()