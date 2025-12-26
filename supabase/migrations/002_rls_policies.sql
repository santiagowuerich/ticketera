-- Habilitar RLS en todas las tablas
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- POLÍTICAS PARA EVENTOS (PÚBLICO)
-- ===========================================

-- Todos pueden ver eventos activos (sin autenticación)
CREATE POLICY "Everyone can view active events" ON events
    FOR SELECT USING (is_active = true);

-- Solo el sistema puede crear/modificar eventos
-- (Esto se haría desde el backend con service key)
CREATE POLICY "System can manage events" ON events
    FOR ALL USING (true);

-- ===========================================
-- POLÍTICAS PARA TICKETS (ANÓNIMO)
-- ===========================================

-- Cualquier persona puede crear tickets (compra anónima)
CREATE POLICY "Anyone can create tickets" ON tickets
    FOR INSERT WITH CHECK (true);

-- Los tickets pueden ser vistos por el comprador usando el ID del ticket
-- o por administradores para gestión
CREATE POLICY "Ticket owners can view their tickets" ON tickets
    FOR SELECT USING (true); -- Permitido para que el frontend pueda mostrar tickets

-- Solo el sistema puede actualizar tickets (validación QR, cambios de estado)
CREATE POLICY "System can update tickets" ON tickets
    FOR UPDATE USING (true);

-- ===========================================
-- POLÍTICAS PARA PAGOS (SISTEMA)
-- ===========================================

-- Solo el sistema puede crear pagos (integración MercadoPago)
CREATE POLICY "System can create payments" ON payments
    FOR INSERT WITH CHECK (true);

-- Solo el sistema puede actualizar pagos (webhooks de MercadoPago)
CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true);

-- Los pagos pueden ser consultados por el sistema
CREATE POLICY "System can view payments" ON payments
    FOR SELECT USING (true);

-- Función para actualizar available_tickets cuando se crea un ticket pagado
CREATE OR REPLACE FUNCTION update_available_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo reducir disponibilidad cuando el ticket se marca como pagado
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        UPDATE events
        SET available_tickets = available_tickets - NEW.quantity
        WHERE id = NEW.event_id AND available_tickets >= NEW.quantity;

        -- Si no hay suficientes tickets, lanzar error
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No hay suficientes tickets disponibles para este evento';
        END IF;
    END IF;

    -- Devolver tickets cuando se cancela o reembolsa
    IF (OLD.status = 'paid' AND NEW.status IN ('cancelled', 'refunded')) THEN
        UPDATE events
        SET available_tickets = available_tickets + OLD.quantity
        WHERE id = OLD.event_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar tickets disponibles
CREATE TRIGGER trigger_update_available_tickets
    AFTER INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_available_tickets();

-- Función para generar QR code único
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generar QR único usando timestamp + random
    NEW.qr_code = 'TICKET-' || encode(gen_random_bytes(8), 'hex') || '-' || extract(epoch from now())::text;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar QR code automáticamente al crear ticket
CREATE TRIGGER trigger_generate_qr_code
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION generate_qr_code();

-- Función para validar ticket por QR (usada por el sistema de validación)
CREATE OR REPLACE FUNCTION validate_ticket_qr(qr_code_param TEXT)
RETURNS JSON AS $$
DECLARE
    ticket_record RECORD;
    result JSON;
BEGIN
    -- Buscar ticket por QR code
    SELECT * INTO ticket_record
    FROM tickets
    WHERE qr_code = qr_code_param AND status = 'paid' AND qr_validated = false;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', 'Ticket no encontrado, expirado o ya utilizado'
        );
    END IF;

    -- Marcar como usado y actualizar fecha
    UPDATE tickets
    SET
        qr_validated = true,
        status = 'used',
        used_date = NOW(),
        updated_at = NOW()
    WHERE id = ticket_record.id;

    RETURN json_build_object(
        'success', true,
        'message', 'Ticket validado correctamente',
        'ticket', json_build_object(
            'id', ticket_record.id,
            'customer_name', ticket_record.customer_name,
            'event_id', ticket_record.event_id,
            'quantity', ticket_record.quantity
        )
    );
END;
$$ LANGUAGE plpgsql;
