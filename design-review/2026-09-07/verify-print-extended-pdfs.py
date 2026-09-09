"""Check every retained extended-PDF page; render separately for visual review."""
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).parent / 'print-extended-audit-output'
reports = []
for name in ['letter-large-wide', 'a4-large-wide', 'letter-tool-families']:
    path = root / (name + '.pdf')
    text = subprocess.check_output(['pdftotext', '-layout', str(path), '-'], text=True)
    document = ET.fromstring(subprocess.check_output(['pdftotext', '-bbox', str(path), '-']))
    pages = document.findall('.//{http://www.w3.org/1999/xhtml}page')
    collisions, outside = [], []
    page_reports = []
    for number, page in enumerate(pages, 1):
        width, height = float(page.attrib['width']), float(page.attrib['height'])
        words = [(w.text, *[float(w.attrib[key]) for key in ['xMin', 'yMin', 'xMax', 'yMax']])
                 for w in page if w.tag.endswith('word')]
        for i, word in enumerate(words):
            if word[1] < 0 or word[2] < 0 or word[3] > width or word[4] > height:
                outside.append({'page': number, 'word': word[0]})
            for other in words[i + 1:]:
                overlap = max(0, min(word[3], other[3]) - max(word[1], other[1])) * max(0, min(word[4], other[4]) - max(word[2], other[2]))
                area = min((word[3] - word[1]) * (word[4] - word[2]), (other[3] - other[1]) * (other[4] - other[2]))
                if area > 0 and overlap / area > 0.2:
                    collisions.append({'page': number, 'words': [word[0], other[0]]})
        page_reports.append({'page': number, 'words': len(words), 'size': [width, height]})
    assert not collisions, collisions
    assert not outside, outside
    assert 'I inspected browser' not in text and 'Open system print' not in text
    if name == 'letter-tool-families':
        assert len(re.findall(r'Supported\s+use:', text)) == 65
        assert len(re.findall(r'Decisive\s+recognition\s+cues:', text)) == 65
    else:
        assert list(map(int, re.findall(r'^\s*(\d+)\.\s', text, re.M))) == list(range(1, 11))
        text_pages = text.split('\f')
        assert any('Questions' in p and re.search(r'^\s*1\.\s', p, re.M) for p in text_pages)
    reports.append({'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                    'pages': page_reports, 'overlappingWords': collisions, 'textOutsidePage': outside,
                    'completeItemText': True, 'printControlsAbsent': True})
(root / 'page-verification.json').write_text(json.dumps(reports, indent=2) + '\n')
print([(report['file'], len(report['pages'])) for report in reports])
