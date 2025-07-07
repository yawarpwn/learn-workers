-- Migration number: 0001 	 2025-07-07T04:46:34.487Z

-- migrations/0002_create_products_table.sql
CREATE TABLE productos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  categoria TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disponible BOOLEAN DEFAULT TRUE
);

-- Insertamos 10 productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock, categoria)
VALUES
  ('Laptop Pro', 'Laptop de 15 pulgadas con 16GB RAM', 1299.99, 50, 'Electrónicos'),
  ('Teclado Mecánico', 'Teclado RGB switches azules', 89.99, 120, 'Periféricos'),
  ('Mouse Inalámbrico', 'Mouse ergonómico 2400DPI', 45.50, 200, 'Periféricos'),
  ('Monitor 24"', 'Monitor Full HD IPS', 199.99, 75, 'Monitores'),
  ('Auriculares Bluetooth', 'Cancelación de ruido', 149.99, 90, 'Audio'),
  ('Disco SSD 1TB', 'SSD NVMe velocidad 3500MB/s', 109.99, 60, 'Almacenamiento'),
  ('Webcam 4K', 'Webcam con micrófono integrado', 79.99, 40, 'Accesorios'),
  ('Router WiFi 6', 'Doble banda 3000Mbps', 129.99, 30, 'Redes'),
  ('Power Bank 20000mAh', 'Carga rápida 18W', 39.99, 150, 'Accesorios'),
  ('Tablet 10"', 'Tablet Android 128GB', 249.99, 45, 'Electrónicos');
