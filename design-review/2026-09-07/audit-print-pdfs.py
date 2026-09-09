"""Audit PDF text bounds and dominant text size; not a visual acceptance test."""
import collections
import json
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

root = Path(sys.argv[1]).resolve()
results = []
for pdf in sorted(root.glob("*.pdf")):
    layout = ET.fromstring(subprocess.check_output(["pdftotext", "-bbox-layout", str(pdf), "-"]))
    pages = layout.findall(".//{*}page")
    outside = []
    for number, page in enumerate(pages, 1):
        width, height = float(page.attrib["width"]), float(page.attrib["height"])
        for word in page.findall(".//{*}word"):
            if (float(word.attrib["xMin"]) < 0 or float(word.attrib["yMin"]) < 0
                or float(word.attrib["xMax"]) > width or float(word.attrib["yMax"]) > height):
                outside.append({"page": number, "word": word.text, "bounds": word.attrib})
    fonts = ET.fromstring(subprocess.check_output(["pdftohtml", "-xml", "-zoom", "1", "-stdout", "-i", str(pdf)]))
    sizes = {}
    characters = collections.Counter()
    for element in fonts.iter():
        if element.tag == "fontspec":
            sizes[element.attrib["id"]] = float(element.attrib["size"])
        elif element.tag == "text":
            characters[sizes[element.attrib["font"]]] += len("".join(element.itertext()))
    dominant = characters.most_common(1)[0][0]
    expected = 18 if "large" in pdf.stem else 12
    results.append({"file": pdf.name, "pages": len(pages), "outOfPageWords": outside,
                    "dominantTextSizePt": dominant, "expectedBodySizePt": expected,
                    "dominantTextMeetsBodySize": dominant >= expected,
                    "charactersByPointSize": dict(sorted(characters.items()))})
report = {"method": "Poppler bbox-layout and pdftohtml XML at zoom 1; dominant size by extracted character count. Small labels are not certified by this check.", "results": results}
(root / "text-layout-audit.json").write_text(json.dumps(report, indent=2) + "\n")
for result in results:
    print(result["file"], result["pages"], "pages; dominant text", result["dominantTextSizePt"], "pt; outside", len(result["outOfPageWords"]))
if any(result["outOfPageWords"] or not result["dominantTextMeetsBodySize"] for result in results):
    sys.exit(1)
