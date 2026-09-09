"""Check the retained 45-question Letter/A4 PDFs with Poppler's text extractors."""
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

root = Path(__file__).parent / 'print-preview-output'
results = []
for paper in ['us-letter', 'a4']:
    pdf = root / f'{paper}-45-questions.pdf'
    text = subprocess.check_output(['pdftotext', '-layout', str(pdf), '-'], text=True)
    questions = list(map(int, re.findall(r'^\s*(\d+)\.\s', text, re.M)))
    assert questions == list(range(1, 46)), questions
    assert 'Open system print' not in text and 'I inspected browser' not in text
    info = subprocess.check_output(['pdfinfo', str(pdf)], text=True)
    document = ET.fromstring(subprocess.check_output(['pdftotext', '-bbox', str(pdf), '-']))
    pages = document.findall('.//{http://www.w3.org/1999/xhtml}page')
    outside = []
    for number, page in enumerate(pages, 1):
        width, height = float(page.attrib['width']), float(page.attrib['height'])
        for word in page:
            if word.tag.endswith('word') and (
                float(word.attrib['xMin']) < 0 or float(word.attrib['yMin']) < 0
                or float(word.attrib['xMax']) > width or float(word.attrib['yMax']) > height
            ):
                outside.append({'page': number, 'word': word.text})
    assert not outside, outside
    results.append({
        'paper': paper, 'pages': len(pages),
        'pageSize': re.search(r'^Page size:\s+(.+)$', info, re.M).group(1),
        'bytes': pdf.stat().st_size, 'searchableQuestions': len(questions),
        'printControlsAbsent': True, 'textOutsidePageBounds': outside,
    })
(root / 'pdf-verification.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results, indent=2))
