"""Optimizar recursos proporcionados sin alterar su contenido. Uso: python script ruta-assets."""
from pathlib import Path
import sys
import json
from PIL import Image

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'public' / 'images'
target.mkdir(parents=True, exist_ok=True)
names = ['imagotipo.png', 'imagotipo-blanco.png', 'cat-pollos.jpg', 'cat-alitas.jpg',
         'cat-bebidas.jpg', 'cat-combos.jpg', 'cat-parrillas.jpg', 'fav-anticuchos.jpg',
         'fav-cuarto-pollo.jpg', 'fav-pollo-entero.jpg']
names += ['catalogo-v2/' + p.name for p in sorted((source / 'catalogo-v2').glob('*.jpg'))]
manifest = []
for name in names:
    with Image.open(source / name) as img:
        img.thumbnail((720, 720) if 'imagotipo' not in name else (600, 240))
        output_name = name.replace('/', '-').replace('.jpg', '.webp').replace('.png', '.webp')
        img.save(target / output_name, 'WEBP', quality=82, method=6, lossless='imagotipo' in name)
        manifest.append({'origen': name, 'archivo': output_name, 'ancho': img.width,
                         'alto': img.height, 'bytes': (target / output_name).stat().st_size})
(target / 'recursos.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(manifest)} recursos preparados; {sum(item["bytes"] for item in manifest)} bytes')
