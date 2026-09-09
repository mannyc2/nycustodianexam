"""Audit generated Atlas record completeness; run after the production build."""
from html.parser import HTMLParser
from pathlib import Path
import json

root = Path(__file__).resolve().parents[2]

class Record(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_main = False
        self.text = []
        self.images = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.in_main = True
        if not self.in_main: return
        if tag == 'img': self.images.append(attrs)
        if tag == 'a': self.links.append(attrs.get('href', ''))
    def handle_endtag(self, tag):
        if tag == 'main': self.in_main = False
    def handle_data(self, data):
        if self.in_main: self.text.append(data)

records = []
for path in sorted((root / 'apps/site/dist/atlas/tool').glob('*/index.html')):
    record = Record()
    record.feed(path.read_text())
    text = ' '.join(record.text)
    for label in ['Primary use', 'Recognition cues', 'Evidence', 'Scope', 'Practice status', 'Source trail']:
        assert label in text, (path, label)
    assert len(record.images) == 1 and record.images[0].get('alt', '').strip(), path
    assert (root / 'apps/site/dist' / record.images[0]['src'].lstrip('/')).is_file(), path
    restricted = 'Reference-only; excluded from scored practice.' in text
    if restricted:
        assert 'Publication restriction' in text or 'Reference-only restriction' in text, path
        assert '/practice/' not in record.links, path
    records.append({'slug': path.parent.name, 'referenceOnly': restricted, 'illustrationAndDescription': True, 'requiredSections': True})
assert len(records) == 65, len(records)
assert sum(record['referenceOnly'] for record in records) == 12
report = {'records': records, 'total': len(records), 'referenceOnly': 12, 'scope': 'Generated record completeness and link restrictions; not source-truth or all-page visual certification.'}
(root / 'design-review/2026-09-07/atlas-record-screenshots/inventory-verification.json').write_text(json.dumps(report, indent=2) + '\n')
print('65 records checked: descriptions, released images, required sections; all 12 reference-only records have restrictions and no practice link in main content.')
