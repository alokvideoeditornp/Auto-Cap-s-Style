import os

def walk(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                yield os.path.join(root, file)

count = 0
for filepath in walk('src'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'replace(/[.,!?;' in content:
        import re
        # Find the regex using a python regex
        # We are looking for /[.,!?;:"'(){}[\]\-]/g but the escaping might be weird
        # Let's just find the start and end of the regex
        new_content = []
        changed = False
        for line in content.split('\n'):
            idx = line.find('replace(/[.,!?;')
            if idx != -1:
                end_idx = line.find('/g', idx)
                if end_idx != -1:
                    old_regex = line[idx+8:end_idx+2]
                    # Python string replace
                    line = line.replace(old_regex, r"/[.,!?;:""'(){}[\]\-।॥]/g")
                    changed = True
            new_content.append(line)
        
        if changed:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write('\n'.join(new_content))
            print('Updated', filepath)
            count += 1

print('Done', count)
