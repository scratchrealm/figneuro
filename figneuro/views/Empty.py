from typing import List
from .View import View


class Empty(View):
    """
    Empty
    """
    def __init__(self,
        **kwargs
    ) -> None:
        super().__init__('Empty', **kwargs)
    def to_dict(self) -> dict:
        ret = {
            'type': self.type
        }
        return ret
    def child_views(self) -> List[View]:
        return []
