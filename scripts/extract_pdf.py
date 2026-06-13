from pathlib import Path
import sys
try:
    import PyPDF2
except ImportError:
    print('MISSING_PYPDF2')
    sys.exit(1)
path = Path('../ADMS_Project_Instructions_HITEC.pdf').resolve()
print('PATH', path)
print('EXISTS', path.exists())
with open(path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    print('PAGES', len(reader.pages))
    for i, page in enumerate(reader.pages):
        print('--- PAGE', i+1)
        text = page.extract_text() or ''
        print(text)
