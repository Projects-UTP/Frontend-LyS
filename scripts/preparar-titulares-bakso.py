"""Exportar arte estático de titulares. La fuente se recibe localmente y no se distribuye.
Uso: python preparar-titulares-bakso.py ruta/BaksoSapi.otf. Requiere Pillow.
"""
from pathlib import Path
import json
import sys
from PIL import Image, ImageDraw, ImageFont

size = 240
font = ImageFont.truetype(sys.argv[1], size)
phrases = ['Sabor peruano', 'en cada brasa.', 'Lo mejor de', 'nuestra carta.',
           'Más brasa.', 'Más momentos.', 'La brasa', 'nos reúne.',
           'Tu punto de encuentro.', 'Carabayllo.', '¿Listo para', 'disfrutar?',
           'La brasa nos reúne.', 'Nuestra carta de muestra.', 'Un buen plan empieza aquí.',
           'Te esperamos en Carabayllo.', 'Conversemos.', 'Esta página se pasó de cocción.',
           'El sabor en primer plano.']
root = Path(__file__).resolve().parents[1]
target = root / 'public' / 'typography'
target.mkdir(exist_ok=True)
manifest = {}
for i, phrase in enumerate(phrases):
    text = phrase.upper()
    left, top, right, bottom = font.getbbox(text)
    width, height = right - left + 4, bottom - top + 4
    image = Image.new('RGBA', (width, height))
    ImageDraw.Draw(image).text((2 - left, 2 - top), text, font=font, fill='black')
    name = f'bakso-titulo-{i+1}.png'
    image.save(target / name, optimize=True)
    manifest[phrase] = {'file': name, 'width': width / size, 'ratio': width / height}
(root / 'src' / 'shared' / 'ui' / 'bakso-titulares.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'{len(phrases)} titulares de Bakso Sapi preparados')
