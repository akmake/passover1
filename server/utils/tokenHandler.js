    import jwt from 'jsonwebtoken';

    const signAccessToken = (payload) =>
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

    const signRefreshToken = (payload) =>
        jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    export const createAndSendTokens = (user, res) => {
        const accessTokenPayload = { id: user._id, role: user.role };
        const refreshTokenPayload = { id: user._id, version: user.tokenVersion };
        const accessToken = signAccessToken(accessTokenPayload);
        const refreshToken = signRefreshToken(refreshTokenPayload);

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'test', // Secure except in test env
            sameSite: 'strict',
        };

        res.cookie('access_token', accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        res.cookie('refresh_token', refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    };
    
