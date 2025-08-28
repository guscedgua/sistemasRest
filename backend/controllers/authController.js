/**
 * @desc Verificar token y obtener perfil de usuario
 * @route POST /api/auth/verify
 * @access Public (pero requiere token válido)
 */
export const verifyTokenAndGetProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error interno del servidor.',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};