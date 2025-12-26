-- Insertar eventos de ejemplo
INSERT INTO events (title, description, short_description, image_url, start_date, end_date, location, capacity, available_tickets, price, currency) VALUES
(
    'Exposición de Arte Contemporáneo',
    'Una colección impresionante de obras de artistas contemporáneos locales e internacionales. Explora las tendencias actuales del arte moderno y descubre nuevas perspectivas artísticas.',
    'Colección de arte contemporáneo con obras de artistas locales e internacionales.',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '37 days',
    'Sala Principal - Planta Baja',
    200,
    200,
    1500.00,
    'ARS'
),
(
    'Museo de la Ciencia Interactiva',
    'Descubre los secretos de la ciencia a través de experimentos interactivos. Desde física cuántica hasta biología molecular, una experiencia educativa para todas las edades.',
    'Experimentos científicos interactivos para toda la familia.',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '44 days',
    'Sala de Ciencias - Segundo Piso',
    150,
    150,
    1200.00,
    'ARS'
),
(
    'Historia Natural: Evolución de la Vida',
    'Viaje a través del tiempo para explorar la evolución de la vida en la Tierra. Desde los primeros organismos unicelulares hasta los mamíferos modernos.',
    'Viaje temporal por la evolución de la vida en nuestro planeta.',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '51 days',
    'Sala de Historia Natural - Tercer Piso',
    100,
    100,
    1000.00,
    'ARS'
),
(
    'Fotografía Urbana Contemporánea',
    'Capturas impresionantes de la vida urbana moderna. Una colección que refleja la diversidad cultural y arquitectónica de nuestras ciudades.',
    'Fotografías que capturan la esencia de la vida urbana contemporánea.',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
    NOW() + INTERVAL '28 days',
    NOW() + INTERVAL '58 days',
    'Sala de Fotografía - Primer Piso',
    80,
    80,
    800.00,
    'ARS'
),
(
    'Arte Precolombino',
    'Descubre las ricas culturas precolombinas a través de cerámicas, textiles y objetos ceremoniales. Una ventana al pasado prehispánico de América.',
    'Colección de arte y objetos de culturas precolombinas.',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '65 days',
    'Sala de Antropología - Cuarto Piso',
    120,
    120,
    1100.00,
    'ARS'
);

-- Insertar algunos tickets de ejemplo (compras anónimas)
INSERT INTO tickets (event_id, customer_name, customer_email, customer_dni, customer_phone, quantity, total_price, currency, status, purchase_date, qr_validated) VALUES
(
    (SELECT id FROM events WHERE title = 'Exposición de Arte Contemporáneo'),
    'María González',
    'maria.gonzalez@email.com',
    '12345678',
    '+54911234567',
    2,
    3000.00,
    'ARS',
    'paid',
    NOW() - INTERVAL '5 days',
    false
),
(
    (SELECT id FROM events WHERE title = 'Museo de la Ciencia Interactiva'),
    'Carlos Rodríguez',
    'carlos.rodriguez@email.com',
    '87654321',
    '+54911876543',
    1,
    1200.00,
    'ARS',
    'paid',
    NOW() - INTERVAL '3 days',
    true
),
(
    (SELECT id FROM events WHERE title = 'Historia Natural: Evolución de la Vida'),
    'Ana López',
    'ana.lopez@email.com',
    '11223344',
    '+54911987654',
    3,
    3000.00,
    'ARS',
    'paid',
    NOW() - INTERVAL '1 day',
    false
);

-- Insertar pagos de ejemplo
INSERT INTO payments (ticket_id, mercadopago_payment_id, mercadopago_preference_id, amount, currency, status, payment_method, payment_date, payer_email) VALUES
(
    (SELECT id FROM tickets WHERE customer_email = 'maria.gonzalez@email.com'),
    '123456789',
    'pref_123456789',
    3000.00,
    'ARS',
    'approved',
    'credit_card',
    NOW() - INTERVAL '5 days',
    'maria.gonzalez@email.com'
),
(
    (SELECT id FROM tickets WHERE customer_email = 'carlos.rodriguez@email.com'),
    '987654321',
    'pref_987654321',
    1200.00,
    'ARS',
    'approved',
    'debit_card',
    NOW() - INTERVAL '3 days',
    'carlos.rodriguez@email.com'
),
(
    (SELECT id FROM tickets WHERE customer_email = 'ana.lopez@email.com'),
    '555666777',
    'pref_555666777',
    3000.00,
    'ARS',
    'approved',
    'credit_card',
    NOW() - INTERVAL '1 day',
    'ana.lopez@email.com'
);
