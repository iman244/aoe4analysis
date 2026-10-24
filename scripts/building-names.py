"""Build the pbgid -> [name, kind, icon file] lookup used by the 2D replay page.
Icons themselves are downloaded into public/building-icons/ (see reference/building-icon-urls.txt).

  python3 scripts/building-names.py reference/aoe4world-buildings-all.json OUT.json

Input is https://raw.githubusercontent.com/aoe4world/data/main/buildings/all.json
(open source, non-commercial, Microsoft Game Content Usage Rules).
"""
import json, sys

KINDS = [
    ('landmark', ('Landmark', 'Wonder')),
    ('religious', ('Religious',)),
    ('technology', ('Technology',)),
    ('defense', ('Defensive',)),
    ('military', ('Military',)),
    ('economy', ('Economy', 'Population', 'Food', 'Trade')),
]


def kind_of(item):
    # Only the capital (starting) town center is a landmark; later town centers are economy buildings.
    if 'landmark' in item.get('classes', []):
        return 'landmark'
    classes = ' '.join(item.get('displayClasses', []))
    for kind, words in KINDS:
        if any(w in classes for w in words):
            return kind
    return 'other'


items = json.load(open(sys.argv[1]))['data']
names = {str(it['pbgid']): [it['name'], kind_of(it), it['icon'].rsplit('/', 1)[1]] for it in items}
json.dump(names, open(sys.argv[2], 'w'), separators=(',', ':'), sort_keys=True)
print(len(names), 'buildings')
