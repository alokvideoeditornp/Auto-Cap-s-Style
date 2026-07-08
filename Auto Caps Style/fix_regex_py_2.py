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
    
    # We are replacing `/[.,!?;:'(){}[\]\-।॥]/g` with `/[.,!?;:"'(){}[\]\-।॥]/g`
    if "/[.,!?;:'(){}[\\]\\-।॥]/g" in content:
        content = content.replace("/[.,!?;:'(){}[\\]\\-।॥]/g", "/[.,!?;:\"'(){}[\\]\\-।॥]/g")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Updated', filepath)
        count += 1

print('Done', count)
