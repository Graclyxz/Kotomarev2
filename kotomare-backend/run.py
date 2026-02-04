#!/usr/bin/env python
"""Script para ejecutar el servidor de desarrollo"""

from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
