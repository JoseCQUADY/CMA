-- =================================================================
-- Database Objects: Views, Stored Procedures, and Triggers
-- Sistema de Bitácora de Mantenimiento
-- =================================================================

-- =================================================================
-- VIEWS (Snapshots)
-- =================================================================

-- Vista: Resumen de equipos con conteo de mantenimientos
CREATE OR REPLACE VIEW v_equipos_resumen AS
SELECT 
    e.id,
    e.nombre,
    e.marca,
    e.modelo,
    e."numeroSerie",
    e."idControl",
    e.ubicacion,
    e.estado,
    e."createdAt",
    e."updatedAt",
    COALESCE(COUNT(m.id), 0) AS total_mantenimientos,
    MAX(m.fecha) AS ultimo_mantenimiento,
    MIN(m."fechaProximoManto") FILTER (WHERE m."fechaProximoManto" > NOW()) AS proximo_mantenimiento
FROM "Equipo" e
LEFT JOIN "Mantenimiento" m ON e.id = m."equipoId" AND m.estado = 'ACTIVO'
WHERE e.estado = 'ACTIVO'
GROUP BY e.id;

-- Vista: Historial de mantenimientos con información del técnico y equipo
CREATE OR REPLACE VIEW v_mantenimientos_detalle AS
SELECT 
    m.id,
    m."equipoId",
    e.nombre AS equipo_nombre,
    e.marca AS equipo_marca,
    e.modelo AS equipo_modelo,
    e.ubicacion AS equipo_ubicacion,
    m."tipoMantenimiento",
    m.fecha,
    m."tecnicoId",
    u.nombre AS tecnico_nombre,
    u.email AS tecnico_email,
    m.observaciones,
    m."nombreObjetoEvidencia",
    m."fechaProximoManto",
    m.estado,
    m."createdAt"
FROM "Mantenimiento" m
INNER JOIN "Equipo" e ON m."equipoId" = e.id
INNER JOIN "Usuario" u ON m."tecnicoId" = u.id
WHERE m.estado = 'ACTIVO';

-- Vista: Estadísticas de mantenimiento por técnico
CREATE OR REPLACE VIEW v_estadisticas_tecnico AS
SELECT 
    u.id AS tecnico_id,
    u.nombre AS tecnico_nombre,
    u.email AS tecnico_email,
    u.rol,
    COUNT(m.id) AS total_mantenimientos,
    COUNT(CASE WHEN m."tipoMantenimiento" ILIKE '%preventivo%' THEN 1 END) AS mantenimientos_preventivos,
    COUNT(CASE WHEN m."tipoMantenimiento" ILIKE '%correctivo%' THEN 1 END) AS mantenimientos_correctivos,
    COUNT(CASE WHEN m.fecha >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) AS mantenimientos_mes_actual,
    MAX(m.fecha) AS ultimo_mantenimiento
FROM "Usuario" u
LEFT JOIN "Mantenimiento" m ON u.id = m."tecnicoId" AND m.estado = 'ACTIVO'
WHERE u.estado = 'ACTIVO'
GROUP BY u.id;

-- Vista: Equipos que requieren mantenimiento próximo (próximos 30 días)
CREATE OR REPLACE VIEW v_equipos_mantenimiento_pendiente AS
SELECT 
    e.id AS equipo_id,
    e.nombre AS equipo_nombre,
    e.marca,
    e.modelo,
    e.ubicacion,
    m.id AS mantenimiento_id,
    m."fechaProximoManto",
    m."tipoMantenimiento" AS ultimo_tipo,
    u.nombre AS ultimo_tecnico,
    EXTRACT(DAY FROM (m."fechaProximoManto" - CURRENT_DATE)) AS dias_restantes
FROM "Equipo" e
INNER JOIN "Mantenimiento" m ON e.id = m."equipoId"
INNER JOIN "Usuario" u ON m."tecnicoId" = u.id
WHERE e.estado = 'ACTIVO'
    AND m.estado = 'ACTIVO'
    AND m."fechaProximoManto" IS NOT NULL
    AND m."fechaProximoManto" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY m."fechaProximoManto" ASC;


-- =================================================================
-- STORED PROCEDURES (Procedimientos Almacenados)
-- =================================================================

-- Procedimiento: Registrar nuevo mantenimiento
CREATE OR REPLACE FUNCTION sp_registrar_mantenimiento(
    p_equipo_id UUID,
    p_tecnico_id UUID,
    p_tipo_mantenimiento VARCHAR(255),
    p_observaciones TEXT,
    p_fecha_proximo TIMESTAMP DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_mantenimiento_id UUID;
BEGIN
    -- Verificar que el equipo existe y está activo
    IF NOT EXISTS (SELECT 1 FROM "Equipo" WHERE id = p_equipo_id AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'El equipo no existe o está inactivo';
    END IF;
    
    -- Verificar que el técnico existe y está activo
    IF NOT EXISTS (SELECT 1 FROM "Usuario" WHERE id = p_tecnico_id AND estado = 'ACTIVO') THEN
        RAISE EXCEPTION 'El técnico no existe o está inactivo';
    END IF;
    
    -- Insertar el registro de mantenimiento
    INSERT INTO "Mantenimiento" (
        id, 
        "equipoId", 
        "tecnicoId", 
        "tipoMantenimiento", 
        fecha, 
        observaciones, 
        "fechaProximoManto",
        estado,
        "createdAt"
    )
    VALUES (
        gen_random_uuid(),
        p_equipo_id,
        p_tecnico_id,
        p_tipo_mantenimiento,
        CURRENT_TIMESTAMP,
        p_observaciones,
        p_fecha_proximo,
        'ACTIVO',
        CURRENT_TIMESTAMP
    )
    RETURNING id INTO v_mantenimiento_id;
    
    RETURN v_mantenimiento_id;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento: Obtener estadísticas del sistema
CREATE OR REPLACE FUNCTION sp_obtener_estadisticas()
RETURNS TABLE (
    total_equipos BIGINT,
    equipos_activos BIGINT,
    total_mantenimientos BIGINT,
    mantenimientos_mes BIGINT,
    total_usuarios BIGINT,
    usuarios_activos BIGINT,
    mantenimientos_pendientes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM "Equipo")::BIGINT AS total_equipos,
        (SELECT COUNT(*) FROM "Equipo" WHERE estado = 'ACTIVO')::BIGINT AS equipos_activos,
        (SELECT COUNT(*) FROM "Mantenimiento")::BIGINT AS total_mantenimientos,
        (SELECT COUNT(*) FROM "Mantenimiento" WHERE fecha >= DATE_TRUNC('month', CURRENT_DATE))::BIGINT AS mantenimientos_mes,
        (SELECT COUNT(*) FROM "Usuario")::BIGINT AS total_usuarios,
        (SELECT COUNT(*) FROM "Usuario" WHERE estado = 'ACTIVO')::BIGINT AS usuarios_activos,
        (SELECT COUNT(*) FROM "Mantenimiento" 
         WHERE estado = 'ACTIVO' 
         AND "fechaProximoManto" IS NOT NULL 
         AND "fechaProximoManto" <= CURRENT_DATE + INTERVAL '30 days')::BIGINT AS mantenimientos_pendientes;
END;
$$ LANGUAGE plpgsql;

-- Procedimiento: Desactivar equipos sin uso por más de un año
CREATE OR REPLACE FUNCTION sp_limpiar_equipos_inactivos(
    p_dias INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE "Equipo" e
    SET estado = 'INACTIVO',
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE estado = 'ACTIVO'
    AND NOT EXISTS (
        SELECT 1 FROM "Mantenimiento" m 
        WHERE m."equipoId" = e.id 
        AND m.fecha >= CURRENT_DATE - (p_dias || ' days')::INTERVAL
    )
    AND e."createdAt" < CURRENT_DATE - (p_dias || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;


-- =================================================================
-- TRIGGERS (Disparadores)
-- =================================================================

-- Tabla para registro de auditoría
CREATE TABLE IF NOT EXISTS "AuditoriaLog" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabla VARCHAR(100) NOT NULL,
    operacion VARCHAR(20) NOT NULL,
    registro_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    usuario_id UUID,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Función para trigger de auditoría de equipos
CREATE OR REPLACE FUNCTION fn_auditoria_equipo()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_nuevos, fecha)
        VALUES ('Equipo', 'INSERT', NEW.id, to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, fecha)
        VALUES ('Equipo', 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_anteriores, fecha)
        VALUES ('Equipo', 'DELETE', OLD.id, to_jsonb(OLD), CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger de auditoría para equipos
DROP TRIGGER IF EXISTS tr_auditoria_equipo ON "Equipo";
CREATE TRIGGER tr_auditoria_equipo
    AFTER INSERT OR UPDATE OR DELETE ON "Equipo"
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_equipo();

-- Función para trigger de auditoría de mantenimientos
CREATE OR REPLACE FUNCTION fn_auditoria_mantenimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_nuevos, fecha)
        VALUES ('Mantenimiento', 'INSERT', NEW.id, to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_anteriores, datos_nuevos, fecha)
        VALUES ('Mantenimiento', 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "AuditoriaLog" (tabla, operacion, registro_id, datos_anteriores, fecha)
        VALUES ('Mantenimiento', 'DELETE', OLD.id, to_jsonb(OLD), CURRENT_TIMESTAMP);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger de auditoría para mantenimientos
DROP TRIGGER IF EXISTS tr_auditoria_mantenimiento ON "Mantenimiento";
CREATE TRIGGER tr_auditoria_mantenimiento
    AFTER INSERT OR UPDATE OR DELETE ON "Mantenimiento"
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_mantenimiento();

-- Función para trigger que actualiza updatedAt automáticamente
CREATE OR REPLACE FUNCTION fn_actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger de updated_at para equipos
DROP TRIGGER IF EXISTS tr_updated_at_equipo ON "Equipo";
CREATE TRIGGER tr_updated_at_equipo
    BEFORE UPDATE ON "Equipo"
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_updated_at();

-- Trigger para validar email único antes de insertar usuario
CREATE OR REPLACE FUNCTION fn_validar_email_usuario()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM "Usuario" 
        WHERE email = NEW.email 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'El email % ya está registrado', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validar_email_usuario ON "Usuario";
CREATE TRIGGER tr_validar_email_usuario
    BEFORE INSERT OR UPDATE ON "Usuario"
    FOR EACH ROW EXECUTE FUNCTION fn_validar_email_usuario();


-- =================================================================
-- GRANT PERMISSIONS (Permisos)
-- =================================================================
-- Nota: Descomentar y ajustar según el usuario de la base de datos

-- GRANT SELECT ON v_equipos_resumen TO public;
-- GRANT SELECT ON v_mantenimientos_detalle TO public;
-- GRANT SELECT ON v_estadisticas_tecnico TO public;
-- GRANT SELECT ON v_equipos_mantenimiento_pendiente TO public;
-- GRANT EXECUTE ON FUNCTION sp_registrar_mantenimiento TO public;
-- GRANT EXECUTE ON FUNCTION sp_obtener_estadisticas TO public;


-- =================================================================
-- EJEMPLO DE USO
-- =================================================================
-- 
-- -- Consultar vista de equipos con resumen
-- SELECT * FROM v_equipos_resumen;
-- 
-- -- Consultar mantenimientos detallados
-- SELECT * FROM v_mantenimientos_detalle WHERE fecha >= '2024-01-01';
-- 
-- -- Obtener estadísticas del técnico
-- SELECT * FROM v_estadisticas_tecnico;
-- 
-- -- Equipos con mantenimiento pendiente
-- SELECT * FROM v_equipos_mantenimiento_pendiente;
-- 
-- -- Registrar un mantenimiento usando el procedimiento almacenado
-- SELECT sp_registrar_mantenimiento(
--     'equipo-uuid-here'::UUID,
--     'tecnico-uuid-here'::UUID,
--     'Preventivo',
--     'Se realizó limpieza y calibración del equipo'
-- );
-- 
-- -- Obtener estadísticas generales
-- SELECT * FROM sp_obtener_estadisticas();
-- 
-- -- Ver auditoría
-- SELECT * FROM "AuditoriaLog" ORDER BY fecha DESC LIMIT 20;
