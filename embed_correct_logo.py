import base64
import re

img_path = r'E:\ingenusfx\public\img\logos\IMG_5208.PNG'
html_path = r'e:\ingenusfx\testfactura.html'

with open(img_path, 'rb') as img_file:
    b64_string = base64.b64encode(img_file.read()).decode('utf-8')

new_src = f'data:image/png;base64,{b64_string}'

with open(html_path, 'r', encoding='utf-8') as html_file:
    content = html_file.read()

# Replace any data:image/png;base64... with the new one
content = re.sub(r'src="data:image/png;base64,[^"]+"', f'src="{new_src}"', content)

with open(html_path, 'w', encoding='utf-8') as html_file:
    html_file.write(content)

print("Replaced with new base64 logo!")
