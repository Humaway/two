# Saves a workflow's output JSON (result list/str/dict) as markdown: python3 tools/save-report.py <output.json> <dest.md> <title>
import json, sys
d = json.load(open(sys.argv[1]))
r = d.get('result', d)
def flat(x):
    if isinstance(x, str): return x
    if isinstance(x, list): return '\n\n---\n\n'.join(flat(y) for y in x)
    if isinstance(x, dict): return '\n\n'.join(f'## {k}\n\n{flat(v)}' for k, v in x.items())
    return str(x)
open(sys.argv[2], 'w').write(f'# {sys.argv[3]}\n\n' + flat(r) + '\n')
print(sys.argv[2], len(flat(r)))
