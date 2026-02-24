import sys

with open('logo_b64.txt', 'r') as f:
    b64 = f.read().strip()

with open('testfactura.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('src="/img/logos/IMG_5208.PNG"', f'src="{b64}"')

with open('testfactura.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacement done!")
